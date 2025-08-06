"""
Algorand Fusion Escrow Contract
Simple test implementation
Compatible with PyTeal 0.20.0+
"""

from pyteal import *

def approval_program():
    """Approval program for the escrow contract"""
    
    # Handle creation
    handle_creation = Seq([
        App.globalPut(Bytes("owner"), Txn.sender()),
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
    
    # Simple test method
    test_method = Seq([
        Return(Int(1))
    ])
    
    # Handle application calls
    handle_noop = Cond(
        [Txn.application_args[0] == Bytes("test"), test_method]
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