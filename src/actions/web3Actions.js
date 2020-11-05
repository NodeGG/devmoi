
import MetaMaskOnboarding from '@metamask/onboarding';
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';

/**
 * Detects the window.ethereum var
 */
const _provider = async () => {
  try {
    await detectEthereumProvider();
  } catch (error) {
    return false;
  }
  return true;
};
/**
 *  Handles the Web3.js Provider.
 *  If it detects MetaMask then it will use window.ethereum as the Provider.
 *  If MetaMask isn't detected then the INFURA_API will be used to as a provider.
 */

const _isMetaMask = async () => {
  try {
    ethereum.isMetaMask;
  } catch (error) {
    console.group();
    console.warn('isMetaMask: Ethereum Not Detected');
    console.warn('To Enjoy the full Experience');
    console.warn('Please visit: https://MetaMask.io ❤');
    console.groupEnd();
    return false;
  }
  return true;
};

export const initWeb3 = () => async (dispatch) => {
  const api = process.env.INFURA_API;
  try {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);

      return true;
    } else {
      window.web3 = new Web3(new Web3.providers.HttpProvider(api));

      return true;
    }
  } catch (error) {
    return false;
  }
};
/**
 * Handles Onboarding User When connecting to metamask
 * @param {*} params
 */
const onboardUser = async () => {
  try {
    const onboarding = new MetaMaskOnboarding();
    (await _provider())
      ? onboarding.stopOnboarding()
      : onboarding.startOnboarding();
  } catch (error) {
    console.log('onboardUser: ', error);
  }
};
//
export const login = (props) => async (dispatch) => {
  try {
    web3.currentProvider
      .enable()
      .then(() => console.log('Get ETH Connection'))
      .catch(() => onboardUser());
    dispatch({ type: 'SET_AUTH_STATUS', payload: true });
  } catch (error) {
    await console.log('Login: ', error);
  }
};
//
export const getAddress = () => async (dispatch) => {
  try {
    let address = await web3.eth.getAccounts();
    if (address) {
      web3.eth.defaultAccount = await address[0];

      dispatch(setAddress(address[0]));
    }
  } catch (error) {
    console.error('getAddress', error);
  }
};
//
export const getBalance = () => async (dispatch) => {
  try {
    await web3.eth
      .getBalance(web3.eth.defaultAccount)
      .then((res) => {
        dispatch(setBalance(web3.utils.fromWei(res, 'ether')));
      })
      .catch((error) => {
        if (error.code === 4001) {
          // EIP-1193 userRejectedRequest error
          console.log('Please connect to MetaMask.');
        } else {
          console.error(error);
        }
      });
  } catch (error) {
    console.error('getBalance', error);
  }
};
//
const getNetwork = () => async (dispatch) => {
  await web3.eth.net
    .getNetworkType()
    .then((res) => dispatch(setChainId(res)))
    .catch((err) => {
      console.log('getNetwork', err);
    });
};
//
export const init = (props) => async (dispatch, getState) => {
  try {
    await dispatch(initWeb3());
    await dispatch(getAddress());
    await dispatch(getBalance());
    await dispatch(getNetwork());
    await ethereum.on('chainChanged', (chainId) => {
      window.location.reload();
    });
    await ethereum.on('accountsChanged', (newAccounts) => {
      console.log(newAccounts);
      dispatch(setAddress(newAccounts));
    });
    return async () => {
      await ethereum.off('accountsChanged', (newAccounts) => {
        dispatch(setAddress(newAccounts));
      });
    };
  } catch (error) {
    console.error('isAuth Error:', error);
  }
};
//


// Setters
export const setAddress = (addr) => async (dispatch) => {
  try {
    if (addr == null) addr = [];

    dispatch({
      type: 'SET_ADDRESS',
      payload: addr,
    });
  } catch (error) {
    console.log(error);
  }
};
export const setChainId = (payload) => (dispatch) => {
  dispatch({
    type: 'SET_CHAINID',
    payload,
  });
};

export const setBalance = (payload) => (dispatch) =>
  dispatch({ type: 'SET_BALANCE', payload });