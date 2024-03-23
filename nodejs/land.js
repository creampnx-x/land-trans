const { FileSystemWallet, Gateway } = require('fabric-network');
const path = require('path');

const ccpPath = path.resolve(__dirname, '..', 'connection', 'connection-org1.json');

/**
 * 提供操作区块链链接
 * 
 * @param {string} userId 钱包中的用户，用于验证身份
 * @param {*} infomation 操作的信息，如参数、用户、执行的动作
 * @param {*} isQuery 是否是一个查询动作
 * @param {*} contractFile 合同 [默认土地合同(在本文件中)]
 * @returns {Array} 返回一个二位数组，第一个元素为结果，第二个元素是错误信息
 */
async function baseConnection(userId, infomation, isQuery = true, contractFile = 'land') {
    try {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists(userId);
        if (!userExists) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            throw new Error("user does not register.");
            // return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet, identity: userId, discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract(contractFile);

        let result = null;

        if (isQuery)
            result = await contract.evaluateTransaction(infomation.method, ...infomation.args);
        else
            result = await contract.submitTransaction(infomation.method, ...infomation.args);

        // Disconnect from the gateway.
        gateway.disconnect();

        return [result?.toString(), null];
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        return [null, error?.toString()];
    }

}




/*********************< LAND >*********************************/

// invoke
/**
 * 使用参数创建土地
 */
async function CreateLand(infomation) {
    return await baseConnection(infomation.userId, infomation, false);
}

/**
 * 管理员通过 土地上传申请
 * @param args [landId]
 */
async function ValidLand(infomation) {
    return await baseConnection(infomation.userId, infomation, false);
}

/**
 * 使用键值更改土地信息
 * @param args [landId, key, value]
 * 例如: ['beijing0101', 'owner', 'pinxue02']
 */
async function UpdateLand(infomation) {
    return await baseConnection(infomation.userId, infomation, false);
}


// query
/**
 * 使用 landId 查询土地信息，返回土地信息对象
 * @param args [landId]
*/
async function QueryLand(infomation) {
    return await baseConnection(infomation.userId, infomation);
}

/**
 * 使用 其他键值 查询土地信息/列表
 * @param arg [key, value]
 * 例如：
 *    1. [CreatedBy, pinxue01]
 *    2. [Position, beijing]
 */
async function QueryLandByKey(infomation) {
    return await baseConnection(infomation.userId, infomation);
}

module.exports.Land = {
    CreateLand,
    ValidLand,
    UpdateLand,
    QueryLand,
    QueryLandByKey
}




/****************************< USRE >********************************/

// invoke
/**
 * @param args [name, userId, password, role, whoboss] 
 */
async function CreateUser(infomation) {
    return await baseConnection(infomation.userId, infomation, false, 'users');
}

// query 
/**
 * [userId, password]
 */
async function LogIn(infomation) {
    return baseConnection(infomation.userId, infomation, true, 'users');
}

/**
 * [userId]
 */
async function QueryUser(infomation) {
    return baseConnection(infomation.userId, infomation, true, 'users');
}

module.exports.User = {
    CreateUser,
    LogIn,
    QueryUser
}



/*****************************< TRANSATION >****************************/

//  invoke
/**
 * @param arg [userId, transationId, landId, requester, validar, isValid, date, price]
 */
async function CreateTransation(infomation) {
    return baseConnection(infomation.userId, infomation, false, 'tran');
}

/**
 * @param arg [transationId]
 */
async function ValidTransation(infomation) {
    return baseConnection(infomation.userId, infomation, false, 'tran');
}

// query
/**
 * @param arg [transationId]
 */
async function QueryTransation(infomation) {
    return baseConnection(infomation.userId, infomation, true, 'tran');
}

/**
 * @param arg [key, value]
 */
async function QueryTransationByKey(infomation) {
    return baseConnection(infomation.userId, infomation, true, 'tran');
}


module.exports.Transation = {
    CreateTransation,
    ValidTransation,
    QueryTransation,
    QueryTransationByKey
}

/**********************< END >**************************/