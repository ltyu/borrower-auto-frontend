import { ethers } from 'ethers';
import { OnCronjobHandler } from '@metamask/snaps-types';
import { panel, text } from '@metamask/snaps-ui';

declare var window: any

export const onCronjob: OnCronjobHandler = async ({ request }) => {
  // Requests account once
  const accounts: string[] = await window.ethereum.request({ method: 'eth_requestAccounts' });
  
  switch (request.method) {
    case 'checkLiquidation':
      await checkLiquidation(accounts[0])
    default:
      throw new Error('Method not found.');
  }
};

async function checkLiquidation(address: string) {
  // Gets the collateral ratio
  const isLiquidatable = await isLiquidatableRequest();
  if (isLiquidatable) {
    const response = await fetch(`http://localhost:5001/api/repay/${address}`, { 
      method: 'POST',
      headers: {
        'content-type': 'application/json;charset=UTF-8',
      },
    });
    const signature = await response.text();
    if (response.ok) { 
      // If theres a signature, try to repay the loan
      if (!!signature) {
        // Notify the User that the loan is being repaid
        return snap.request({
          method: 'snap_dialog',
          params: {
            type: 'alert',
            content: panel([
              text(`Collateral ratio below minimum CR, attempting to auto repay loan.`),
            ]),
          },
        });

      // No signature, just warn the user
      } else {
        return snap.request({
          method: 'snap_dialog',
          params: {
            type: 'alert',
            content: panel([
              text(`Collateral ratio below minimum CR, consider repaying loan`),
            ]),
          },
        });
      }
    }
  }
}

async function isLiquidatableRequest(): Promise<boolean> {
  const res = await fetch(`http://localhost:5001/api/liquidatable`);
  return JSON.parse(await res.text());
}