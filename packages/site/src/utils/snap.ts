import { MetaMaskInpageProvider } from '@metamask/providers';
import { defaultSnapOrigin } from '../config';
import { GetSnapsResponse, Snap } from '../types';
import * as ethers from 'ethers';

/**
 * Get the installed snaps in MetaMask.
 *
 * @param provider - The MetaMask inpage provider.
 * @returns The snaps installed in MetaMask.
 */
export const getSnaps = async (
  provider?: MetaMaskInpageProvider,
): Promise<GetSnapsResponse> =>
  (await (provider ?? window.ethereum).request({
    method: 'wallet_getSnaps',
  })) as unknown as GetSnapsResponse;
/**
 * Connect a snap to MetaMask.
 *
 * @param snapId - The ID of the snap.
 * @param params - The params to pass with the snap to connect.
 */
export const connectSnap = async (
  snapId: string = defaultSnapOrigin,
  params: Record<'version' | string, unknown> = {},
) => {
  await window.ethereum.request({
    method: 'wallet_requestSnaps',
    params: {
      [snapId]: params,
    },
  });
};

/**
 * Get the snap from MetaMask.
 *
 * @param version - The version of the snap to install (optional).
 * @returns The snap object returned by the extension.
 */
export const getSnap = async (version?: string): Promise<Snap | undefined> => {
  try {
    const snaps = await getSnaps();

    return Object.values(snaps).find(
      (snap) =>
        snap.id === defaultSnapOrigin && (!version || snap.version === version),
    );
  } catch (e) {
    console.log('Failed to obtain installed snap', e);
    return undefined;
  }
};

/**
 * Persists the signature remotely.
 */
export const sendSignature = async () => {
  const { signature, signer } = await createSignature();
  fetch('http://localhost:5001/api/signature', {
    method: 'POST',
    headers: {
      'content-type': 'application/json;charset=UTF-8',
    },
    body: JSON.stringify({
      signer,
      signature
    })
  })
};

async function createSignature() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const { chainId } = await provider.getNetwork();

  // EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)
  const domain = {
    name: 'CollateralVault',
    version: '1',
    chainId,
    verifyingContract: '0x5195357D9a9aF75f35a5c52BC37313A0B5CD3C2E'
  };

  // Repay(address receiver)
  const types = {
    Repay: [
      { name: 'receiver', type: 'address' },
    ]
  };

  const message = {
    receiver: "0x1E176c822Bec0BE7581C0e31cF3A80f1bB075d76",
  };

  const signature = await signer.signTypedData(domain, types, message);
  return  { signature, signer };
}

export const isLocalSnap = (snapId: string) => snapId.startsWith('local:');
