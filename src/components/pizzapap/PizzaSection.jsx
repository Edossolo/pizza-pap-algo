import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { NotificationError, NotificationSuccess } from "../utils/Notifications";
import PlaceOrder from "./Order";
import PrevOrders from "./PrevOrders";
import pizza1 from "../../assets/img/pizza1.jpg";
import pizza2 from "../../assets/img/pizza2.jpg";
import pizza3 from "../../assets/img/pizza3.jpg";
import pizza4 from "../../assets/img/pizza4.jpg";
import pizza5 from "../../assets/img/pizza5.jpg";
import pizza6 from "../../assets/img/pizza6.jpg";
import {
  createOrderAction,
  confirmOrderAction,
  deleteOrderAction,
  getOrdersAction,
} from "../../utils/pizzapap";

const PizzaSection = ({ address, fetchBalance }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [orderStatus, setOrderStatus] = useState(0);

  const getOrders = async () => {
    setLoading2(true);
    getOrdersAction(address)
      .then((orders) => {
        if (orders) {
          setOrders(orders);
        }
      })
      .catch((error) => {
        setLoading2(false);
        console.log(error);
      })
      .finally(() => {
        setLoading2(false);
      });
  };

  const createOrder = async (data) => {
    setLoading(true);
    createOrderAction(address, data)
      .then(() => {
        setLoading(false);
        setOrderStatus(1);
        toast(<NotificationSuccess text="Order added successfully." />);
        getOrders();
        fetchBalance(address);
      })
      .catch((error) => {
        setOrderStatus(2);
        setLoading(false);
        console.log(error);
        toast(<NotificationError text="Failed to create order." />);
      })
      .finally(() => {
        setTimeout(() => {
          setOrderStatus(0);
        }, 3000);
      });
  };

  const confirmDelivery = async (pizza) => {
    setLoading2(true);
    confirmOrderAction(address, pizza)
      .then(() => {
        toast(<NotificationSuccess text="Order Confirmed" />);
        getOrders();
        fetchBalance(address);
      })
      .catch((error) => {
        setLoading2(false);
        console.log(error);
        toast(<NotificationError text="Failed to confirm order." />);
      });
  };

  const deleteOrder = async (pizza) => {
    setLoading2(true);
    deleteOrderAction(address, pizza.appId)
      .then(() => {
        toast(<NotificationSuccess text="Order deleted successfully" />);
        getOrders();
        fetchBalance(address);
      })
      .catch((error) => {
        setLoading2(false);
        console.log(error);
        toast(<NotificationError text="Failed to delete order." />);
      });
  };

  useEffect(() => {
    getOrders();
  }, []);

  return (
    <>
      <div id="variety" className="container">
        <h2 className="card-title">Our Varieties</h2>
        <div className="row" role="listbox">
          <div className="col-md-4">
            <div className="card mb-2">
              <img className="card-img-top" src={pizza1} alt="pizza1" />
              <div className="card-body">
                <h5 className="card-title">Chicken Tikka</h5>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card mb-2">
              <img className="card-img-top" src={pizza2} alt="pizza2" />
              <div className="card-body">
                <h5 className="card-title">PeriPeri Pizza</h5>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card mb-2">
              <img className="card-img-top" src={pizza3} alt="pizza3" />
              <div className="card-body">
                <h5 className="card-title">Raspberry Dessert Pizza</h5>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card mb-2">
              <img src={pizza4} alt="pizza4" />
              <div className="card-body">
                <h5 className="card-title">Chicken Alfredo Pizza</h5>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card mb-2">
              <img className="card-img-top" src={pizza5} alt="pizza5" />
              <div className="card-body">
                <h5 className="card-title">Sunchoke Pizza</h5>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card mb-2">
              <img className="card-img-top" src={pizza6} alt="pizza6" />
              <div className="card-body">
                <h5 className="card-title">Buffalo Chicken Sticks</h5>
              </div>
            </div>
          </div>
        </div>
      </div>
      <PlaceOrder
        createOrder={createOrder}
        orderStatus={orderStatus}
        loading={loading}
      />
      <PrevOrders
        orders={orders}
        confirmDelivery={confirmDelivery}
        deleteOrder={deleteOrder}
        loading={loading2}
      />
    </>
  );
};

PizzaSection.propTypes = {
  address: PropTypes.string.isRequired,
  fetchBalance: PropTypes.func.isRequired,
};

export default PizzaSection;
