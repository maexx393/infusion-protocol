"""
Algorand Fusion Solver Contract
Very simple PyTeal implementation for solver management
Compatible with PyTeal 0.20.0+
"""

from pyteal import *

def approval_program():
    """Approval program for the solver contract"""
    
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
    
    # Register solver
    register_solver = Seq([
        Assert(Txn.application_args.length() == Int(1)),  # solver_address
        Assert(Txn.fee() >= Int(1000)),
        
        # Register solver
        App.globalPut(Bytes("solver"), Txn.application_args[0]),
        
        Return(Int(1))
    ])
    
    # Execute swap
    execute_swap = Seq([
        Assert(Txn.application_args.length() == Int(1)),  # secret
        Assert(Txn.fee() >= Int(1000)),
        
        # Verify solver is registered
        Assert(App.globalGet(Bytes("solver")) != Bytes("")),
        
        Return(Int(1))
    ])
    
    # Handle application calls
    handle_noop = Cond(
        [Txn.application_args[0] == Bytes("register_solver"), register_solver],
        [Txn.application_args[0] == Bytes("execute_swap"), execute_swap]
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
    """Clear state program for the solver contract"""
    return Return(Int(1))

if __name__ == "__main__":
    with open("solver_approval.teal", "w") as f:
        compiled = compileTeal(approval_program(), mode=Mode.Application, version=6)
        f.write(compiled)
    
    with open("solver_clear.teal", "w") as f:
        compiled = compileTeal(clear_state_program(), mode=Mode.Application, version=6)
        f.write(compiled) 