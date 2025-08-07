"""
Algorand Fusion Pool Contract
Simplified production-ready implementation for liquidity management
Compatible with PyTeal 0.20.0+

This contract implements:
- Basic liquidity provision and removal
- Fee collection
- Pool statistics tracking
"""

from pyteal import *

def approval_program():
    """Approval program for the liquidity pool contract"""
    
    # Global state keys
    owner_key = Bytes("owner")
    total_liquidity_key = Bytes("total_liquidity")
    total_shares_key = Bytes("total_shares")
    total_fees_key = Bytes("total_fees")
    
    # Local state keys for providers
    provider_shares_key = Bytes("shares")
    provider_liquidity_key = Bytes("liquidity")
    provider_active_key = Bytes("active")
    
    # Handle creation
    handle_creation = Seq([
        App.globalPut(owner_key, Txn.sender()),
        App.globalPut(total_liquidity_key, Int(0)),
        App.globalPut(total_shares_key, Int(0)),
        App.globalPut(total_fees_key, Int(0)),
        Return(Int(1))
    ])
    
    # Handle opt-in
    handle_optin = Return(Int(1))
    
    # Handle close-out
    handle_closeout = Return(Int(1))
    
    # Handle update (only owner can update)
    handle_update = Seq([
        Assert(App.globalGet(owner_key) == Txn.sender()),
        Return(Int(1))
    ])
    
    # Handle delete (only owner can delete)
    handle_delete = Seq([
        Assert(App.globalGet(owner_key) == Txn.sender()),
        Return(Int(1))
    ])
    
    # Add liquidity method
    # Args: [0] amount
    add_liquidity = Seq([
        Assert(Txn.application_args.length() == Int(1)),
        
        # Validate payment
        Assert(Gtxn[0].type_enum() == TxnType.Payment),
        Assert(Gtxn[0].sender() == Txn.sender()),
        Assert(Gtxn[0].receiver() == Global.current_application_address()),
        Assert(Gtxn[0].amount() == Btoi(Txn.application_args[0])),
        Assert(Btoi(Txn.application_args[0]) > Int(0)),
        
        # Update global state
        App.globalPut(total_liquidity_key, App.globalGet(total_liquidity_key) + Btoi(Txn.application_args[0])),
        App.globalPut(total_shares_key, App.globalGet(total_shares_key) + Btoi(Txn.application_args[0])),
        
        # Update provider state
        App.localPut(Txn.sender(), provider_shares_key, App.localGet(Txn.sender(), provider_shares_key) + Btoi(Txn.application_args[0])),
        App.localPut(Txn.sender(), provider_liquidity_key, App.localGet(Txn.sender(), provider_liquidity_key) + Btoi(Txn.application_args[0])),
        App.localPut(Txn.sender(), provider_active_key, Int(1)),
        
        Return(Int(1))
    ])
    
    # Remove liquidity method
    # Args: [0] shares_to_remove
    remove_liquidity = Seq([
        Assert(Txn.application_args.length() == Int(1)),
        
        # Validate shares
        Assert(Btoi(Txn.application_args[0]) > Int(0)),
        
        # Check provider has enough shares
        Assert(App.localGet(Txn.sender(), provider_shares_key) >= Btoi(Txn.application_args[0])),
        
        # Update global state
        App.globalPut(total_liquidity_key, App.globalGet(total_liquidity_key) - Btoi(Txn.application_args[0])),
        App.globalPut(total_shares_key, App.globalGet(total_shares_key) - Btoi(Txn.application_args[0])),
        
        # Update provider state
        App.localPut(Txn.sender(), provider_shares_key, App.localGet(Txn.sender(), provider_shares_key) - Btoi(Txn.application_args[0])),
        App.localPut(Txn.sender(), provider_liquidity_key, App.localGet(Txn.sender(), provider_liquidity_key) - Btoi(Txn.application_args[0])),
        
        # Transfer liquidity back to provider
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.Payment,
            TxnField.amount: Btoi(Txn.application_args[0]),
            TxnField.receiver: Txn.sender(),
            TxnField.fee: Int(0)
        }),
        InnerTxnBuilder.Submit(),
        
        Return(Int(1))
    ])
    
    # Collect fees method
    # Args: [0] fee_amount
    collect_fees = Seq([
        Assert(Txn.application_args.length() == Int(1)),
        
        # Validate payment
        Assert(Gtxn[0].type_enum() == TxnType.Payment),
        Assert(Gtxn[0].sender() == Txn.sender()),
        Assert(Gtxn[0].receiver() == Global.current_application_address()),
        Assert(Gtxn[0].amount() == Btoi(Txn.application_args[0])),
        Assert(Btoi(Txn.application_args[0]) > Int(0)),
        
        # Update global fees
        App.globalPut(total_fees_key, App.globalGet(total_fees_key) + Btoi(Txn.application_args[0])),
        
        Return(Int(1))
    ])
    
    # Get pool info method
    get_pool_info = Seq([
        # Return pool information (this is a view method)
        # The actual data retrieval would be done by the client
        Return(Int(1))
    ])
    
    # Get provider info method
    # Args: [0] provider_address
    get_provider_info = Seq([
        Assert(Txn.application_args.length() == Int(1)),
        
        # Return provider information (this is a view method)
        # The actual data retrieval would be done by the client
        Return(Int(1))
    ])
    
    # Handle application calls
    handle_noop = Cond(
        [Txn.application_args[0] == Bytes("add_liquidity"), add_liquidity],
        [Txn.application_args[0] == Bytes("remove_liquidity"), remove_liquidity],
        [Txn.application_args[0] == Bytes("collect_fees"), collect_fees],
        [Txn.application_args[0] == Bytes("get_pool_info"), get_pool_info],
        [Txn.application_args[0] == Bytes("get_provider_info"), get_provider_info]
    )
    
    # Main program
    program = Cond(
        [Txn.application_id() == Int(0), handle_creation],
        [Txn.on_completion() == OnComplete.OptIn, handle_optin],
        [Txn.on_completion() == OnComplete.CloseOut, handle_closeout],
        [Txn.on_completion() == OnComplete.UpdateApplication, handle_update],
        [Txn.on_completion() == OnComplete.DeleteApplication, handle_delete],
        [Txn.on_completion() == OnComplete.NoOp, handle_noop]
    )
    
    return program

def clear_state_program():
    """Clear state program for the pool contract"""
    return Return(Int(1))

if __name__ == "__main__":
    with open("pool_approval.teal", "w") as f:
        compiled = compileTeal(approval_program(), mode=Mode.Application, version=6)
        f.write(compiled)
    
    with open("pool_clear.teal", "w") as f:
        compiled = compileTeal(clear_state_program(), mode=Mode.Application, version=6)
        f.write(compiled) 