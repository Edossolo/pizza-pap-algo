import algosdk from "algosdk";

import {
  algodClient,
  indexerClient,
  pizzapapNote,
  pizzpapAddr,
  minRound,
  myAlgoConnect,
  numGlobalBytes,
  numGlobalInts,
  numLocalBytes,
  numLocalInts,
} from "./constants";
/* eslint import/no-webpack-loader-syntax: off */
import approvalProgram from "!!raw-loader!../contracts/pizzapap_approval.teal";
import clearProgram from "!!raw-loader!../contracts/pizzapap_clear.teal";
import { base64ToUTF8String, utf8ToBase64String } from "./conversions";

class Pizza {
  constructor(appId, flavor, size, crust, toppings, total, status) {
    this.appId = appId;
    this.flavor = flavor;
    this.size = size;
    this.crust = crust;
    this.toppings = toppings;
    this.total = total;
    this.status = status;
  }
}

// Compile smart contract in .teal format to program
const compileProgram = async (programSource) => {
  let encoder = new TextEncoder();
  let programBytes = encoder.encode(programSource);
  let compileResponse = await algodClient.compile(programBytes).do();
  return new Uint8Array(Buffer.from(compileResponse.result, "base64"));
};

// CREATE Order: ApplicationCreateTxn
export const createOrderAction = async (senderAddress, orderDetails) => {
  console.log("Creating order...");

  let params = await algodClient.getTransactionParams().do();

  // Compile programs
  const compiledApprovalProgram = await compileProgram(approvalProgram);
  const compiledClearProgram = await compileProgram(clearProgram);

  // Build note to identify transaction later and required app args as Uint8Arrays
  let note = new TextEncoder().encode(pizzapapNote);
  let flavor = new TextEncoder().encode(orderDetails.flavor);
  let size = new TextEncoder().encode(orderDetails.size);
  let crust = new TextEncoder().encode(orderDetails.crust);
  let toppings = new TextEncoder().encode(orderDetails.toppings);
  let name = new TextEncoder().encode(orderDetails.name);
  let phoneNumber = new TextEncoder().encode(orderDetails.phoneNumber);
  let location = new TextEncoder().encode(orderDetails.location);
  let total = algosdk.encodeUint64(orderDetails.total);

  console.log(total, orderDetails.total);
  let appArgs = [
    flavor,
    size,
    crust,
    toppings,
    name,
    phoneNumber,
    location,
    total,
  ];

  // Create ApplicationCreateTxn
  let createCallTxn = algosdk.makeApplicationCreateTxnFromObject({
    from: senderAddress,
    suggestedParams: params,
    onComplete: algosdk.OnApplicationComplete.NoOpOC,
    approvalProgram: compiledApprovalProgram,
    clearProgram: compiledClearProgram,
    numLocalInts: numLocalInts,
    numLocalByteSlices: numLocalBytes,
    numGlobalInts: numGlobalInts,
    numGlobalByteSlices: numGlobalBytes,
    note: note,
    appArgs: appArgs,
  });

  // Create PaymentTxn
  let paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: senderAddress,
    to: pizzpapAddr,
    amount: orderDetails.total,
    suggestedParams: params,
  });

  let txnArray = [createCallTxn, paymentTxn];

  // Create group transaction out of previously build transactions
  let groupID = algosdk.computeGroupID(txnArray);
  for (let i = 0; i < 2; i++) txnArray[i].group = groupID;

  // Sign & submit the group transaction
  let signedTxn = await myAlgoConnect.signTransaction(
    txnArray.map((txn) => txn.toByte())
  );
  console.log("Signed group transaction");
  let tx = await algodClient
    .sendRawTransaction(signedTxn.map((txn) => txn.blob))
    .do();

  // Wait for group transaction to be confirmed
  let confirmedTxn = await algosdk.waitForConfirmation(algodClient, tx.txId, 4);

  // Notify about completion
  console.log(
    "Group transaction " +
      tx.txId +
      " confirmed in round " +
      confirmedTxn["confirmed-round"]
  );
};

// CONFIRM ORDER: ApplicationCallTxn
export const confirmOrderAction = async (senderAddress, pizza) => {
  console.log("Confirming your order");

  let params = await algodClient.getTransactionParams().do();

  // Build required app args as Uint8Array
  let confirmArg = new TextEncoder().encode("confirm");
  let appArgs = [confirmArg];

  // Create ApplicationDeleteTxn
  let txn = algosdk.makeApplicationCallTxnFromObject({
    from: senderAddress,
    appIndex: pizza.appId,
    onComplete: algosdk.OnApplicationComplete.NoOpOC,
    suggestedParams: params,
    appArgs: appArgs,
  });

  // Get transaction ID
  let txId = txn.txID().toString();

  // Sign & submit the transaction
  let signedTxn = await myAlgoConnect.signTransaction(txn.toByte());
  console.log("Signed transaction with txID: %s", txId);
  await algodClient.sendRawTransaction(signedTxn.blob).do();

  // Wait for transaction to be confirmed
  const confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);

  // Get the completed Transaction
  console.log(
    "Transaction " +
      txId +
      " confirmed in round " +
      confirmedTxn["confirmed-round"]
  );

  // Get application id of deleted application and notify about completion
  let transactionResponse = await algodClient
    .pendingTransactionInformation(txId)
    .do();
  let appId = transactionResponse["txn"]["txn"].apid;
  console.log("Deleted app-id: ", appId);
};

// DELETE Order: ApplicationDeleteTxn
export const deleteOrderAction = async (senderAddress, index) => {
  console.log("Deleting application...");

  let params = await algodClient.getTransactionParams().do();

  // Create ApplicationDeleteTxn
  let txn = algosdk.makeApplicationDeleteTxnFromObject({
    from: senderAddress,
    suggestedParams: params,
    appIndex: index,
  });

  // Get transaction ID
  let txId = txn.txID().toString();

  // Sign & submit the transaction
  let signedTxn = await myAlgoConnect.signTransaction(txn.toByte());
  console.log("Signed transaction with txID: %s", txId);
  await algodClient.sendRawTransaction(signedTxn.blob).do();

  // Wait for transaction to be confirmed
  const confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);

  // Get the completed Transaction
  console.log(
    "Transaction " +
      txId +
      " confirmed in round " +
      confirmedTxn["confirmed-round"]
  );

  // Get application id of deleted application and notify about completion
  let transactionResponse = await algodClient
    .pendingTransactionInformation(txId)
    .do();
  let appId = transactionResponse["txn"]["txn"].apid;
  console.log("Deleted app-id: ", appId);
};

// GET ORDERS: Use indexer
export const getOrdersAction = async (senderAddress) => {
  console.log("Fetching orders...");
  let note = new TextEncoder().encode(pizzapapNote);
  let encodedNote = Buffer.from(note).toString("base64");

  // Step 1: Get all transactions by notePrefix (+ minRound filter for performance)
  let transactionInfo = await indexerClient
    .searchForTransactions()
    .notePrefix(encodedNote)
    .txType("appl")
    .minRound(minRound)
    .address(senderAddress)
    .do();

  let orders = [];
  for (const transaction of transactionInfo.transactions) {
    let appId = transaction["created-application-index"];
    if (appId) {
      // Step 2: Get each application by application id
      let order = await getApplication(appId);
      if (order) {
        orders.push(order);
      }
    }
  }
  console.log("Orders fetched.");
  return orders;
};

const getApplication = async (appId) => {
  try {
    // 1. Get application by appId
    let response = await indexerClient
      .lookupApplications(appId)
      .includeAll(true)
      .do();
    if (response.application.deleted) {
      return null;
    }
    let globalState = response.application.params["global-state"];

    // 2. Parse fields of response and return product
    let flavor = "";
    let size = "";
    let crust = "";
    let toppings = "";
    let total = 0;
    let status = "";

    const getField = (fieldName, globalState) => {
      return globalState.find((state) => {
        return state.key === utf8ToBase64String(fieldName);
      });
    };

    if (getField("FLAVOR", globalState) !== undefined) {
      let field = getField("FLAVOR", globalState).value.bytes;
      flavor = base64ToUTF8String(field);
    }

    if (getField("SIZE", globalState) !== undefined) {
      let field = getField("SIZE", globalState).value.bytes;
      size = base64ToUTF8String(field);
    }

    if (getField("CRUST", globalState) !== undefined) {
      let field = getField("CRUST", globalState).value.bytes;
      crust = base64ToUTF8String(field);
    }

    if (getField("TOPPINGS", globalState) !== undefined) {
      let field = getField("TOPPINGS", globalState).value.bytes;
      toppings = base64ToUTF8String(field);
    }

    if (getField("TOTAL", globalState) !== undefined) {
      total = getField("TOTAL", globalState).value.uint;
    }

    if (getField("STATUS", globalState) !== undefined) {
      status = getField("STATUS", globalState).value.uint;
    }

    return new Pizza(appId, flavor, size, crust, toppings, total, status);
  } catch (err) {
    return null;
  }
};
