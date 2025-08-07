"""
Algorand Fusion HTLC Escrow Contract
Production-ready implementation for cross-chain atomic swaps
Compatible with PyTeal 0.20.0+

This contract implements:
- HTLC (Hash Time-Locked Contract) functionality
- Order creation and management
- Atomic swap execution
- Security features for cross-chain swaps
"""

from pyteal import *

def approval_program():
    """Approval program for the HTLC escrow contract"""
    
    # Global state keys
    owner_key = Bytes("owner")
    total_orders_key = Bytes("total_orders")
    total_volume_key = Bytes("total_volume")
    
    # Status constants
    STATUS_PENDING = Int(0)
    STATUS_FUNDED = Int(1)
    STATUS_CLAIMED = Int(2)
    STATUS_REFUNDED = Int(3)
    
    # Handle creation
    handle_creation = Seq([
        App.globalPut(owner_key, Txn.sender()),
        App.globalPut(total_orders_key, Int(0)),
        App.globalPut(total_volume_key, Int(0)),
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
    
    # Create order method
    # Args: [0] order_id, [1] claimer_address, [2] hashlock, [3] timelock
    create_order = Seq([
        Assert(Txn.application_args.length() == Int(5)),
        Assert(Btoi(Txn.application_args[4]) > Global.latest_timestamp()),
        App.localPut(Txn.sender(), Bytes("order_amount"), Int(0)),
        App.localPut(Txn.sender(), Bytes("order_depositor"), Txn.sender()),
        App.localPut(Txn.sender(), Bytes("order_claimer"), Txn.application_args[2]),
        App.localPut(Txn.sender(), Bytes("order_hashlock"), Txn.application_args[3]),
        App.localPut(Txn.sender(), Bytes("order_timelock"), Btoi(Txn.application_args[4])),
        App.localPut(Txn.sender(), Bytes("order_status"), STATUS_PENDING),
        App.globalPut(total_orders_key, App.globalGet(total_orders_key) + Int(1)),
        Return(Int(1))
    ])
    
    # Fund order method
    # Args: [0] order_id
    fund_order = Seq([
        Assert(Txn.application_args.length() == Int(1)),
        Assert(Gtxn[0].type_enum() == TxnType.Payment),
        Assert(Gtxn[0].sender() == Txn.sender()),
        Assert(Gtxn[0].receiver() == Global.current_application_address()),
        Assert(Gtxn[0].amount() > Int(0)),
        Assert(App.localGet(Txn.sender(), Bytes("order_status")) == STATUS_PENDING),
        App.localPut(Txn.sender(), Bytes("order_amount"), Gtxn[0].amount()),
        App.localPut(Txn.sender(), Bytes("order_status"), STATUS_FUNDED),
        App.globalPut(total_volume_key, App.globalGet(total_volume_key) + Gtxn[0].amount()),
        Return(Int(1))
    ])
    
    # Claim order method
    # Args: [0] order_id, [1] secret
    claim_order = Seq([
        Assert(Txn.application_args.length() == Int(2)),
        Assert(App.localGet(Txn.sender(), Bytes("order_status")) == STATUS_FUNDED),
        Assert(App.localGet(Txn.sender(), Bytes("order_hashlock")) == Sha256(Txn.application_args[1])),
        Assert(Txn.sender() == App.localGet(Txn.sender(), Bytes("order_claimer"))),
        App.localPut(Txn.sender(), Bytes("order_status"), STATUS_CLAIMED),
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.Payment,
            TxnField.amount: App.localGet(Txn.sender(), Bytes("order_amount")),
            TxnField.receiver: App.localGet(Txn.sender(), Bytes("order_claimer")),
            TxnField.fee: Int(0)
        }),
        InnerTxnBuilder.Submit(),
        Return(Int(1))
    ])
    
    # Refund order method
    # Args: [0] order_id
    refund_order = Seq([
        Assert(Txn.application_args.length() == Int(1)),
        Assert(App.localGet(Txn.sender(), Bytes("order_status")) == STATUS_FUNDED),
        Assert(Global.latest_timestamp() > App.localGet(Txn.sender(), Bytes("order_timelock"))),
        Assert(Txn.sender() == App.localGet(Txn.sender(), Bytes("order_depositor"))),
        App.localPut(Txn.sender(), Bytes("order_status"), STATUS_REFUNDED),
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.Payment,
            TxnField.amount: App.localGet(Txn.sender(), Bytes("order_amount")),
            TxnField.receiver: App.localGet(Txn.sender(), Bytes("order_depositor")),
            TxnField.fee: Int(0)
        }),
        InnerTxnBuilder.Submit(),
        Return(Int(1))
    ])
    
    # Get order info method
    # Args: [0] order_id
    get_order_info = Seq([
        Assert(Txn.application_args.length() == Int(1)),
        Return(Int(1))
    ])
    
    # Handle application calls
    handle_noop = Cond(
        [Txn.application_args[0] == Bytes("create_order"), create_order],
        [Txn.application_args[0] == Bytes("fund_order"), fund_order],
        [Txn.application_args[0] == Bytes("claim_order"), claim_order],
        [Txn.application_args[0] == Bytes("refund_order"), refund_order],
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