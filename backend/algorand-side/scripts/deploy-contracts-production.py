#!/usr/bin/env python3
"""
Production Algorand Contract Deployment Script
Deploys real PyTeal contracts to Algorand testnet
Compatible with Python 3.9 and PyTeal 0.10.1
"""

import os
import sys
import json
import time
import base64
from pathlib import Path
from typing import Dict, Any

# Add the current directory to Python path
sys.path.append(str(Path(__file__).parent.parent))

try:
    import algosdk
    from algosdk import account, mnemonic
    from algosdk.v2client import algod
    from algosdk.future import transaction
    from algosdk.future.transaction import ApplicationCreateTxn
    from algosdk.error import AlgodHTTPError
except ImportError as e:
    print(f"❌ Error: {e}")
    print("Please install algosdk: pip install algosdk")
    sys.exit(1)

# Configuration
ALGOD_ADDRESS = "https://testnet-api.algonode.cloud"
ALGOD_TOKEN = ""
INDEXER_ADDRESS = "https://testnet-idx.algonode.cloud"

# Contract names
CONTRACTS = ["escrow", "solver", "pool"]

class AlgorandDeployer:
    def __init__(self, deployer_mnemonic: str):
        self.algod_client = algod.AlgodClient(ALGOD_TOKEN, ALGOD_ADDRESS)
        self.indexer_client = algod.AlgodClient(ALGOD_TOKEN, INDEXER_ADDRESS)
        self.deployer_private_key = mnemonic.to_private_key(deployer_mnemonic)
        self.deployer_address = account.address_from_private_key(self.deployer_private_key)
        
    def compile_contract(self, contract_name: str) -> Dict[str, Any]:
        """Compile a PyTeal contract"""
        print(f"🔨 Compiling {contract_name} contract...")
        
        try:
            # Import and compile the contract
            if contract_name == "escrow":
                from contracts.escrow import approval_program, clear_state_program
            elif contract_name == "solver":
                from contracts.solver import approval_program, clear_state_program
            elif contract_name == "pool":
                from contracts.pool import approval_program, clear_state_program
            else:
                raise ValueError(f"Unknown contract: {contract_name}")
            
            # Compile approval program
            approval_ast = approval_program()
            approval_teal = algosdk.logic.compileTeal(approval_ast, mode=algosdk.logic.Mode.Application, version=5)
            approval_response = self.algod_client.compile(approval_teal)
            approval_program_bytes = base64.b64decode(approval_response['result'])
            
            # Compile clear state program
            clear_ast = clear_state_program()
            clear_teal = algosdk.logic.compileTeal(clear_ast, mode=algosdk.logic.Mode.Application, version=5)
            clear_response = self.algod_client.compile(clear_teal)
            clear_program_bytes = base64.b64decode(clear_response['result'])
            
            return {
                'approval_program': approval_program_bytes,
                'clear_program': clear_program_bytes,
                'approval_teal': approval_teal,
                'clear_teal': clear_teal
            }
        except Exception as e:
            print(f"❌ Error compiling {contract_name}: {e}")
            raise
    
    def deploy_contract(self, contract_name: str, compiled_contract: Dict[str, Any]) -> Dict[str, Any]:
        """Deploy a compiled contract"""
        print(f"🚀 Deploying {contract_name} contract...")
        
        try:
            # Get suggested parameters
            params = self.algod_client.suggested_params()
            
            # Create unsigned transaction
            txn = ApplicationCreateTxn(
                sender=self.deployer_address,
                sp=params,
                on_complete=transaction.OnComplete.NoOpOC,
                approval_program=compiled_contract['approval_program'],
                clear_program=compiled_contract['clear_program'],
                global_schema=transaction.StateSchema(num_uints=5, num_byte_slices=0),
                local_schema=transaction.StateSchema(num_uints=10, num_byte_slices=5)
            )
            
            # Sign transaction
            signed_txn = txn.sign(self.deployer_private_key)
            
            # Submit transaction
            tx_id = self.algod_client.send_transaction(signed_txn)
            print(f"📤 Transaction submitted: {tx_id}")
            
            # Wait for confirmation
            confirmed_txn = self.wait_for_confirmation(tx_id)
            
            # Get application ID
            app_id = confirmed_txn['application-index']
            
            return {
                'contract_name': contract_name,
                'app_id': app_id,
                'tx_id': tx_id,
                'deployer_address': self.deployer_address,
                'explorer_url': f"https://testnet.algoexplorer.io/application/{app_id}",
                'deployment_time': time.time()
            }
        except Exception as e:
            print(f"❌ Error deploying {contract_name}: {e}")
            raise
    
    def wait_for_confirmation(self, tx_id: str, timeout: int = 30) -> Dict[str, Any]:
        """Wait for transaction confirmation"""
        start_time = time.time()
        while time.time() - start_time < timeout:
            try:
                confirmed_txn = self.algod_client.pending_transaction_information(tx_id)
                if confirmed_txn.get('confirmed-round', 0) > 0:
                    return confirmed_txn
            except AlgodHTTPError:
                pass
            time.sleep(1)
        raise TimeoutError(f"Transaction {tx_id} not confirmed within {timeout} seconds")
    
    def check_balance(self) -> int:
        """Check deployer account balance"""
        try:
            account_info = self.algod_client.account_information(self.deployer_address)
            return account_info['amount']
        except Exception as e:
            print(f"❌ Error checking balance: {e}")
            return 0
    
    def deploy_all_contracts(self) -> Dict[str, Any]:
        """Deploy all contracts"""
        print("🎯 Starting production deployment of Algorand contracts...")
        print(f"📍 Deployer address: {self.deployer_address}")
        
        # Check balance
        balance = self.check_balance()
        balance_algo = balance / 1_000_000
        print(f"💰 Deployer balance: {balance_algo} ALGO")
        
        if balance_algo < 1:
            raise ValueError("Insufficient balance. Need at least 1 ALGO for deployment.")
        
        deployment_results = {}
        
        for contract_name in CONTRACTS:
            try:
                # Compile contract
                compiled_contract = self.compile_contract(contract_name)
                
                # Deploy contract
                result = self.deploy_contract(contract_name, compiled_contract)
                deployment_results[contract_name] = result
                
                print(f"✅ {contract_name} deployed successfully!")
                print(f"   App ID: {result['app_id']}")
                print(f"   Explorer: {result['explorer_url']}")
                
            except Exception as e:
                print(f"❌ Failed to deploy {contract_name}: {e}")
                raise
        
        return deployment_results

def main():
    """Main deployment function"""
    # Check for deployer mnemonic
    deployer_mnemonic = os.getenv('DEPLOYER_MNEMONIC')
    if not deployer_mnemonic:
        print("❌ Error: DEPLOYER_MNEMONIC environment variable not set")
        print("Please set your deployer mnemonic:")
        print("export DEPLOYER_MNEMONIC='your mnemonic phrase here'")
        sys.exit(1)
    
    try:
        # Create deployer
        deployer = AlgorandDeployer(deployer_mnemonic)
        
        # Deploy all contracts
        results = deployer.deploy_all_contracts()
        
        # Save deployment info
        deployment_info = {
            'deployment_status': 'success',
            'network': 'testnet',
            'deployer_address': deployer.deployer_address,
            'deployment_timestamp': time.time(),
            'contracts': results
        }
        
        with open('deployment-production.json', 'w') as f:
            json.dump(deployment_info, f, indent=2)
        
        print("\n🎉 Production deployment completed successfully!")
        print("📄 Deployment info saved to: deployment-production.json")
        
        # Print summary
        print("\n📋 Deployment Summary:")
        for contract_name, result in results.items():
            print(f"   {contract_name}: App ID {result['app_id']}")
        
        print("\n🔗 Explorer Links:")
        for contract_name, result in results.items():
            print(f"   {contract_name}: {result['explorer_url']}")
        
    except Exception as e:
        print(f"❌ Deployment failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 