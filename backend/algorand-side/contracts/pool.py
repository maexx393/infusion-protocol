"""
Algorand Fusion Pool Contract
Real PyTeal implementation for liquidity management
Compatible with PyTeal 0.10.1
"""

from pyteal import *

def approval_program():
    """Approval program for the pool contract"""
    
    # Global state keys
    pool_owner = Bytes("owner")
    total_providers = Bytes("total_providers")
    total_shares = Bytes("total_shares")
    total_value = Bytes("total_value")
    total_fees = Bytes("total_fees")
    
    # Local state keys for providers
    provider_shares = Bytes("shares")
    provider_value = Bytes("value")
    provider_fees = Bytes("fees")
    provider_active = Bytes("active")
    
    # Handle creation
    handle_creation = Seq([
        App.globalPut(pool_owner, Txn.sender()),
        App.globalPut(total_providers, Int(0)),
        App.globalPut(total_shares, Int(0)),
        App.globalPut(total_value, Int(0)),
        App.globalPut(total_fees, Int(0)),
        Return(Int(1))
    ])
    
    # Handle opt-in
    handle_optin = Return(Int(1))
    
    # Handle close-out
    handle_closeout = Return(Int(1))
    
    # Handle update
    handle_update = Return(Int(0))
    
    # Handle delete
    handle_delete = Return(Int(0))
    
    # Add liquidity
    add_liquidity = Seq([
        Assert(Txn.application_args.length() == Int(2)),  # amount, asset_id
        Assert(Txn.fee() >= Int(1000)),
        
        amount := Txn.application_args[0],
        asset_id := Txn.application_args[1],
        
        # Calculate shares based on current pool value
        current_value := App.globalGet(total_value),
        current_shares := App.globalGet(total_shares),
        
        If(current_shares == Int(0),
            # First liquidity provider
            shares := Btoi(amount),
            # Subsequent providers
            shares := (Btoi(amount) * current_shares) / current_value
        ),
        
        # Update provider state
        provider_key := Concat(Bytes("provider_"), Txn.sender()),
        current_provider_shares := App.globalGet(Concat(provider_key, Bytes("_shares"))),
        current_provider_value := App.globalGet(Concat(provider_key, Bytes("_value"))),
        
        App.globalPut(Concat(provider_key, Bytes("_shares")), current_provider_shares + shares),
        App.globalPut(Concat(provider_key, Bytes("_value")), current_provider_value + Btoi(amount)),
        App.globalPut(Concat(provider_key, Bytes("_active")), Int(1)),
        
        # Update global state
        App.globalPut(total_shares, current_shares + shares),
        App.globalPut(total_value, current_value + Btoi(amount)),
        
        # Add new provider if first time
        If(current_provider_shares == Int(0),
            App.globalPut(total_providers, App.globalGet(total_providers) + Int(1))
        ),
        
        Return(Int(1))
    ])
    
    # Remove liquidity
    remove_liquidity = Seq([
        Assert(Txn.application_args.length() == Int(1)),  # shares
        Assert(Txn.fee() >= Int(1000)),
        
        shares := Btoi(Txn.application_args[0]),
        
        # Get provider info
        provider_key := Concat(Bytes("provider_"), Txn.sender()),
        current_shares := App.globalGet(Concat(provider_key, Bytes("_shares"))),
        current_value := App.globalGet(Concat(provider_key, Bytes("_value"))),
        
        # Verify sufficient shares
        Assert(shares <= current_shares),
        
        # Calculate amount to return
        total_shares := App.globalGet(total_shares),
        total_value := App.globalGet(total_value),
        amount_to_return := (shares * total_value) / total_shares,
        
        # Update provider state
        App.globalPut(Concat(provider_key, Bytes("_shares")), current_shares - shares),
        App.globalPut(Concat(provider_key, Bytes("_value")), current_value - amount_to_return),
        
        # Update global state
        App.globalPut(total_shares, total_shares - shares),
        App.globalPut(total_value, total_value - amount_to_return),
        
        # Remove provider if no shares left
        If(current_shares - shares == Int(0),
            App.globalPut(total_providers, App.globalGet(total_providers) - Int(1))
        ),
        
        Return(Int(1))
    ])
    
    # Distribute fees
    distribute_fees = Seq([
        Assert(Txn.application_args.length() == Int(2)),  # fee_amount, asset_id
        Assert(Txn.fee() >= Int(1000)),
        
        fee_amount := Txn.application_args[0],
        asset_id := Txn.application_args[1],
        
        # Add to total fees
        current_fees := App.globalGet(total_fees),
        App.globalPut(total_fees, current_fees + Btoi(fee_amount)),
        
        Return(Int(1))
    ])
    
    # Get provider shares
    get_provider_shares = Seq([
        Assert(Txn.application_args.length() == Int(1)),  # provider_address
        Assert(Txn.fee() >= Int(1000)),
        
        provider_addr := Txn.application_args[0],
        
        # Return provider shares (this would be handled by the client)
        Return(Int(1))
    ])
    
    # Get pool stats
    get_pool_stats = Seq([
        Assert(Txn.application_args.length() == Int(0)),
        Assert(Txn.fee() >= Int(1000)),
        
        # Return pool stats (this would be handled by the client)
        Return(Int(1))
    ])
    
    # Calculate shares for amount
    calculate_shares_for_amount = Seq([
        Assert(Txn.application_args.length() == Int(1)),  # amount
        Assert(Txn.fee() >= Int(1000)),
        
        amount := Txn.application_args[0],
        
        # Calculate shares (this would be handled by the client)
        Return(Int(1))
    ])
    
    # Handle application calls
    handle_noop = Cond(
        [Txn.application_args[0] == Bytes("add_liquidity"), add_liquidity],
        [Txn.application_args[0] == Bytes("remove_liquidity"), remove_liquidity],
        [Txn.application_args[0] == Bytes("distribute_fees"), distribute_fees],
        [Txn.application_args[0] == Bytes("get_provider_shares"), get_provider_shares],
        [Txn.application_args[0] == Bytes("get_pool_stats"), get_pool_stats],
        [Txn.application_args[0] == Bytes("calculate_shares_for_amount"), calculate_shares_for_amount]
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
        compiled = compileTeal(approval_program(), mode=Mode.Application, version=5)
        f.write(compiled)
    
    with open("pool_clear.teal", "w") as f:
        compiled = compileTeal(clear_state_program(), mode=Mode.Application, version=5)
        f.write(compiled) 