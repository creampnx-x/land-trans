const { FileSystemWallet, Gateway } = require('fabric-network');
const path = require('path');

const ccpPath = path.resolve(__dirname, '..', 'connection', 'connection-org1.json');

async function main(userId, goFile, methodeName, position, id, owner, valid, callback) {

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
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet, identity: userId, discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract(goFile);

        await contract.submitTransaction(methodeName, position, id, owner, valid);
        console.log('Transaction has been submitted');

        // Disconnect from the gateway.
        await gateway.disconnect();
        callback('200')

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        callback('400')
        process.exit(1);
    }

}
main('admin', 'land', 'CreateLand', 'beijing', '1e2d', 'pinxue', 'Yes', (code) => {console.log(code)});