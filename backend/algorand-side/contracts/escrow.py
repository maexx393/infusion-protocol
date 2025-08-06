"""
Algorand Fusion Escrow Contract
Real PyTeal implementation for cross-chain swaps
"""

from pyteal import *

def approval_program():
    """Approval program for the escrow contract"""
    
    # Global state keys
    escrow_owner = Bytes("owner")
    total_orders = Bytes("total_orders")
    total_volume = Bytes("total_volume")
    
    # Local state keys for orders
    order_depositor = Bytes("depositor")
    order_claimer = Bytes("claimer")
    order_amount = Bytes("amount")
    order_hashlock = Bytes("hashlock")
    order_timelock = Bytes("timelock")
    order_claimed = Bytes("claimed")
    order_cancelled = Bytes("cancelled")
    
    # Handle creation
    handle_creation = Seq([
        App.globalPut(escrow_owner, Txn.sender()),
        App.globalPut(total_orders, Int(0)),
        App.globalPut(total_volume, Int(0)),
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
    
    # Create order
    create_order = Seq([
        Assert(Txn.application_args.length() == Int(4)),  # depositor, claimer, amount, hashlock
        Assert(Txn.fee() >= Int(1000)),
        
        # Get order ID
        order_id := App.globalGet(total_orders),
        
        # Store order details
        App.localPut(Txn.sender(), Concat(Bytes("order_"), Itob(order_id), Bytes("_depositor")), Txn.application_args[0]),
        App.localPut(Txn.sender(), Concat(Bytes("order_"), Itob(order_id), Bytes("_claimer")), Txn.application_args[1]),
        App.localPut(Txn.sender(), Concat(Bytes("order_"), Itob(order_id), Bytes("_amount")), Txn.application_args[2]),
        App.localPut(Txn.sender(), Concat(Bytes("order_"), Itob(order_id), Bytes("_hashlock")), Txn.application_args[3]),
        App.localPut(Txn.sender(), Concat(Bytes("order_"), Itob(order_id), Bytes("_timelock")), Txn.latest_timestamp()),
        App.localPut(Txn.sender(), Concat(Bytes("order_"), Itob(order_id), Bytes("_claimed")), Int(0)),
        App.localPut(Txn.sender(), Concat(Bytes("order_"), Itob(order_id), Bytes("_cancelled")), Int(0)),
        
        # Update global state
        App.globalPut(total_orders, order_id + Int(1)),
        App.globalPut(total_volume, App.globalGet(total_volume) + Btoi(Txn.application_args[2])),
        
        Return(Int(1))
    ])
    
    # Claim order
    claim_order = Seq([
        Assert(Txn.application_args.length() == Int(2)),  # order_id, secret
        Assert(Txn.fee() >= Int(1000)),
        
        order_id := Btoi(Txn.application_args[0]),
        secret := Txn.application_args[1],
        
        # Verify hashlock
        hashlock_key := Concat(Bytes("order_"), Itob(order_id), Bytes("_hashlock")),
        stored_hashlock := App.localGet(Txn.sender(), hashlock_key),
        computed_hashlock := Sha256(secret),
        Assert(stored_hashlock == computed_hashlock),
        
        # Check if not already claimed
        claimed_key := Concat(Bytes("order_"), Itob(order_id), Bytes("_claimed")),
        Assert(App.localGet(Txn.sender(), claimed_key) == Int(0)),
        
        # Mark as claimed
        App.localPut(Txn.sender(), claimed_key, Int(1)),
        
        Return(Int(1))
    ])
    
    # Cancel order
    cancel_order = Seq([
        Assert(Txn.application_args.length() == Int(1)),  # order_id
        Assert(Txn.fee() >= Int(1000)),
        
        order_id := Btoi(Txn.application_args[0]),
        
        # Check if not already cancelled
        cancelled_key := Concat(Bytes("order_"), Itob(order_id), Bytes("_cancelled")),
        Assert(App.localGet(Txn.sender(), cancelled_key) == Int(0)),
        
        # Check timelock
        timelock_key := Concat(Bytes("order_"), Itob(order_id), Bytes("_timelock")),
        order_timestamp := App.localGet(Txn.sender(), timelock_key),
        current_timestamp := Txn.latest_timestamp(),
        Assert(current_timestamp > order_timestamp + Int(3600)),  # 1 hour timelock
        
        # Mark as cancelled
        App.localPut(Txn.sender(), cancelled_key, Int(1)),
        
        Return(Int(1))
    ])
    
    # Get order info
    get_order_info = Seq([
        Assert(Txn.application_args.length() == Int(1)),  # order_id
        Assert(Txn.fee() >= Int(1000)),
        
        order_id := Btoi(Txn.application_args[0]),
        
        # Return order details (this would be handled by the client)
        Return(Int(1))
    ])
    
    # Handle application calls
    handle_noop = Cond(
        [Txn.application_args[0] == Bytes("create_order"), create_order],
        [Txn.application_args[0] == Bytes("claim_order"), claim_order],
        [Txn.application_args[0] == Bytes("cancel_order"), cancel_order],
        [Txn.application_args[0] == Bytes("get_order_info"), get_order_info]
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
    """Clear state program for the escrow contract"""
    return Return(Int(1))

if __name__ == "__main__":
    with open("escrow_approval.teal", "w") as f:
        compiled = compileTeal(approval_program(), mode=Mode.Application, version=6)
        f.write(compiled)
    
    with open("escrow_clear.teal", "w") as f:
        compiled = compileTeal(clear_state_program(), mode=Mode.Application, version=6)
        f.write(compiled) 