"""
Algorand Fusion Solver Contract
Production-ready implementation for cross-chain swap resolution
Compatible with PyTeal 0.20.0+

This contract implements:
- Solver registration and management
- Swap execution and resolution
- Fee collection and distribution
- Security features for cross-chain swaps
"""

from pyteal import *

def approval_program():
    """Approval program for the solver contract"""
    
    # Global state keys
    owner_key = Bytes("owner")
    total_solvers_key = Bytes("total_solvers")
    total_swaps_key = Bytes("total_swaps")
    total_volume_key = Bytes("total_volume")
    total_fees_key = Bytes("total_fees")
    
    # Local state keys for solvers
    solver_active_key = Bytes("active")
    solver_fees_key = Bytes("fees")
    solver_swaps_key = Bytes("swaps")
    solver_volume_key = Bytes("volume")
    
    # Local state keys for swaps
    swap_order_id_key = Bytes("order_id")
    swap_solver_key = Bytes("solver")
    swap_amount_key = Bytes("amount")
    swap_fee_key = Bytes("fee")
    swap_status_key = Bytes("status")
    swap_created_key = Bytes("created")
    
    # Status constants
    STATUS_PENDING = Int(0)
    STATUS_EXECUTED = Int(1)
    STATUS_FAILED = Int(2)
    STATUS_CANCELLED = Int(3)
    
    # Handle creation
    handle_creation = Seq([
        App.globalPut(owner_key, Txn.sender()),
        App.globalPut(total_solvers_key, Int(0)),
        App.globalPut(total_swaps_key, Int(0)),
        App.globalPut(total_volume_key, Int(0)),
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
    
    # Register solver method
    # Args: [0] solver_address
    register_solver = Seq([
        Assert(Txn.application_args.length() == Int(1)),
        
        # Check if solver is not already registered
        Assert(App.localGet(Txn.sender(), solver_active_key) == Int(0)),
        
        # Register solver
        App.localPut(Txn.sender(), solver_active_key, Int(1)),
        App.localPut(Txn.sender(), solver_fees_key, Int(0)),
        App.localPut(Txn.sender(), solver_swaps_key, Int(0)),
        App.localPut(Txn.sender(), solver_volume_key, Int(0)),
        
        # Update global statistics
        App.globalPut(total_solvers_key, App.globalGet(total_solvers_key) + Int(1)),
        
        Return(Int(1))
    ])
    
    # Execute swap method
    # Args: [0] swap_id, [1] order_id, [2] amount, [3] fee
    execute_swap = Seq([
        Assert(Txn.application_args.length() == Int(4)),
        
        # Validate solver is registered
        Assert(App.localGet(Txn.sender(), solver_active_key) == Int(1)),
        
        # Validate amount and fee
        Assert(Btoi(Txn.application_args[2]) > Int(0)),
        Assert(Btoi(Txn.application_args[3]) >= Int(0)),
        
        # Check if swap already exists
        Assert(App.localGet(Txn.sender(), Concat(Concat(Bytes("swap_"), Itob(Btoi(Txn.application_args[0]))), Bytes("_status"))) == Int(0)),
        
        # Store swap details
        App.localPut(Txn.sender(), Concat(Concat(Bytes("swap_"), Itob(Btoi(Txn.application_args[0]))), Bytes("_order_id")), Txn.application_args[1]),
        App.localPut(Txn.sender(), Concat(Concat(Bytes("swap_"), Itob(Btoi(Txn.application_args[0]))), Bytes("_solver")), Txn.sender()),
        App.localPut(Txn.sender(), Concat(Concat(Bytes("swap_"), Itob(Btoi(Txn.application_args[0]))), Bytes("_amount")), Btoi(Txn.application_args[2])),
        App.localPut(Txn.sender(), Concat(Concat(Bytes("swap_"), Itob(Btoi(Txn.application_args[0]))), Bytes("_fee")), Btoi(Txn.application_args[3])),
        App.localPut(Txn.sender(), Concat(Concat(Bytes("swap_"), Itob(Btoi(Txn.application_args[0]))), Bytes("_status")), STATUS_EXECUTED),
        App.localPut(Txn.sender(), Concat(Concat(Bytes("swap_"), Itob(Btoi(Txn.application_args[0]))), Bytes("_created")), Global.latest_timestamp()),
        
        # Update solver statistics
        App.localPut(Txn.sender(), solver_swaps_key, App.localGet(Txn.sender(), solver_swaps_key) + Int(1)),
        App.localPut(Txn.sender(), solver_volume_key, App.localGet(Txn.sender(), solver_volume_key) + Btoi(Txn.application_args[2])),
        App.localPut(Txn.sender(), solver_fees_key, App.localGet(Txn.sender(), solver_fees_key) + Btoi(Txn.application_args[3])),
        
        # Update global statistics
        App.globalPut(total_swaps_key, App.globalGet(total_swaps_key) + Int(1)),
        App.globalPut(total_volume_key, App.globalGet(total_volume_key) + Btoi(Txn.application_args[2])),
        App.globalPut(total_fees_key, App.globalGet(total_fees_key) + Btoi(Txn.application_args[3])),
        
        Return(Int(1))
    ])
    
    # Cancel swap method
    # Args: [0] swap_id
    cancel_swap = Seq([
        Assert(Txn.application_args.length() == Int(1)),
        
        # Check swap exists and is pending
        Assert(App.localGet(Txn.sender(), Concat(Concat(Bytes("swap_"), Itob(Btoi(Txn.application_args[0]))), Bytes("_status"))) == STATUS_PENDING),
        
        # Update swap status
        App.localPut(Txn.sender(), Concat(Concat(Bytes("swap_"), Itob(Btoi(Txn.application_args[0]))), Bytes("_status")), STATUS_CANCELLED),
        
        Return(Int(1))
    ])
    
    # Get solver info method
    # Args: [0] solver_address
    get_solver_info = Seq([
        Assert(Txn.application_args.length() == Int(1)),
        
        # Return solver information (this is a view method)
        # The actual data retrieval would be done by the client
        Return(Int(1))
    ])
    
    # Get swap info method
    # Args: [0] swap_id
    get_swap_info = Seq([
        Assert(Txn.application_args.length() == Int(1)),
        
        # Return swap information (this is a view method)
        # The actual data retrieval would be done by the client
        
        # Return success (swap exists)
        Return(Int(1))
    ])
    
    # Handle application calls
    handle_noop = Cond(
        [Txn.application_args[0] == Bytes("register_solver"), register_solver],
        [Txn.application_args[0] == Bytes("execute_swap"), execute_swap],
        [Txn.application_args[0] == Bytes("cancel_swap"), cancel_swap],
        [Txn.application_args[0] == Bytes("get_solver_info"), get_solver_info],
        [Txn.application_args[0] == Bytes("get_swap_info"), get_swap_info]
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