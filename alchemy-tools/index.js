import axios from 'axios'
import ethers from 'ethers'

const ALCHEMY_API_KEY = 'FBoiUgPDqeoeY0fZ2jgvekAIruAZ6t6A'

export const checkNftsInWallet = async (walletId) => {
    const baseURL = `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
    const url = `${baseURL}/getNFTs/?owner=${walletId}`;

    const config = {
      method: 'get',
      url: url,
    };

    return new Promise((resolve, reject) => {
        axios.default.get(url)
        .then((resp) => {
            resolve(resp)
        })
        .catch((error) => {
            reject(error)
        })
    })
    // Getting NFTS from provide wallet
    // const nfts = await axios.default.get(url);
    // return nfts;
}

export const getBalance = async (walletId) => {
    
    const data = JSON.stringify({
        "jsonrpc": "2.0",
        "id": 1,
        "method": "eth_getBalance",
        "params": [
            walletId, 'latest',
        ]
    });

    const config = {
        method: 'post',
        url: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        data: data
    };

    return new Promise((resolve, reject) => {
        axios(config)
        .then(function (response) {
            let balance = response['data']['result'];
            balance = ethers.utils.formatEther(balance);
            console.log(`Balance of ${walletId}: ${balance} ETH`);
            resolve(balance)
        })
        .catch(function (error) {
            console.log(error);
            reject(error)
        });
    })

    // return new Promise((resolve, reject) => {
        // axios.default.get(url)
        // .then((resp) => {
            // resolve(resp)
        // })
        // .catch((error) => {
            // reject(error)
        // })
    // })
    // Getting NFTS from provide wallet
    // const nfts = await axios.default.get(url);
    // return nfts;
}