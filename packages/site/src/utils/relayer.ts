import * as ethers from 'ethers';

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