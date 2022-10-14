import React, { useState } from "react";
import Cover from "./components/Cover";
import "./App.css";
import "./css/style.css";
import "./css/wickedcss.min.css";
import { Container } from "react-bootstrap";
import Header from "./components/pizzapap/Header";
import PizzaSection from "./components/pizzapap/PizzaSection";
import Footer from "./components/pizzapap/Footer";
import { indexerClient, myAlgoConnect } from "./utils/constants";
import { Notification } from "./components/utils/Notifications";
import coverImg from "./assets/img/cover.jpg";

const App = function AppWrapper() {
  const [address, setAddress] = useState(null);
  const [name, setName] = useState(null);
  const [balance, setBalance] = useState(0);

  const fetchBalance = async (accountAddress) => {
    indexerClient
      .lookupAccountByID(accountAddress)
      .do()
      .then((response) => {
        const _balance = response.account.amount;
        setBalance(_balance);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const connectWallet = async () => {
    myAlgoConnect
      .connect()
      .then((accounts) => {
        const _account = accounts[0];
        setAddress(_account.address);
        setName(_account.name);
        fetchBalance(_account.address);
      })
      .catch((error) => {
        console.log("Could not connect to MyAlgo wallet");
        console.error(error);
      });
  };

  const disconnect = () => {
    setAddress(null);
    setName(null);
    setBalance(null);
  };

  return (
    <>
      <Notification />
      {address ? (
        <Container fluid className="main-header">
          <Header
            address={address}
            name={name}
            balance={balance}
            disconnect={disconnect}
          />
          <main>
            <PizzaSection address={address} fetchBalance={fetchBalance} />
          </main>
          <Footer />
        </Container>
      ) : (
        <Cover name={"PIZZAPAP"} coverImg={coverImg} connect={connectWallet} />
      )}
    </>
  );
};

export default App;
