import React, { useCallback, useState } from "react";
import PropTypes from "prop-types";
import { Button, Row, Col, Form } from "react-bootstrap";
import Loader from "../utils/Loader";
import { stringToMicroAlgos } from "../../utils/conversions";

const PlaceOrder = ({ createOrder, orderStatus, loading }) => {
	const toppings = ["Sausage", "Bacon", "Mushroom"];
	const [flavor, setFlavor] = useState("");
	const [size, setSize] = useState("");
	const [crust, setCrust] = useState("");
	const [checkedState, setCheckedState] = useState(
		new Array(toppings.length).fill(false)
	);
	const [toppingsPrice, setToppingsPrice] = useState(0);
	const [toppingsArray, setToppings] = useState([]);
	const [name, setName] = useState("");
	const [phonenumber, setNumber] = useState("");
	const [location, setLocation] = useState("");
	const [total, setTotal] = useState(0);

	const getPrice = (size, crust) => {
		let price = 0;
		if (size) {
			switch (size) {
				case "large":
					price = 2.0;
					break;
				case "medium":
					price += 1.5;
					break;
				case "small":
					price += 1.0;
					break;
				default:
					price += 0;
			}
		}

		if (crust) {
			switch (crust) {
				case "Crispy":
					price += 0.5;
					break;
				case "Stuffed":
					price += 0.5;
					break;
				case "Gluten-free":
					price += 0.3;
					break;
				default:
					price += 0;
			}
		}


		return price;
	};

	const handleSize = (e) => {
		e.preventDefault();
		let newsize = e.target.value;
		console.log(newsize);
		let price = getPrice(newsize, 0);
    		console.log(price);
		let oldPrice = getPrice(size, 0);
		setSize(newsize);
		setTotal((Number(total) + price - oldPrice).toFixed(2));
	};

	const handleCrust = (e) => {
		e.preventDefault();
		let newcrust = e.target.value;
		let price = getPrice(0, newcrust);
		let oldPrice = getPrice(0, crust);
		setCrust(newcrust);
		setTotal((Number(total) + price - oldPrice).toFixed(2));
	};

	const handleToppings = (position) => {
		const updatedCheckedState = checkedState.map((item, index) =>
			index === position ? !item : item
		);

		setCheckedState(updatedCheckedState);

		let _toppings = [];
		for (let i in toppings) {
			if (updatedCheckedState[i]) {
				_toppings.push(toppings[i]);
			}
		}

		setToppings(_toppings);

		const newToppingPrice = updatedCheckedState.reduce(
			(sum, currentState) => {
				if (currentState === true) {
					return sum + 0.1;
				}
				return sum;
			},
			0
		);

		let oldPrice = toppingsPrice;
		setToppingsPrice(newToppingPrice);
		setTotal((Number(total) - oldPrice + newToppingPrice).toFixed(2));
	};

	const isFormFilled = useCallback(() => {
		return name && flavor && size && crust && phonenumber && location;
	}, [name, flavor, size, crust, phonenumber, location]);

	const startOrderTxn = async () => {
		await createOrder({
			flavor,
			size,
			crust,
			name,
			phonenumber,
			location,
			total: stringToMicroAlgos(total),
			toppings: toppingsArray.join(", "),
		});
	};

	return (
		<>
			<div className="order" id="make-order">
				<div className="order-overlay" style={{ height: "600px" }}>
					<div className="controls-top text-center" id="Order-now">
						<h2>Order Here</h2>
					</div>
					<h2>
						Order your pizza here and we will deliver it to you at
						your door step!
					</h2>

					<div className="row">
						<div className="col-sm-5">
							{!loading ? (
								<Form>
									<Row>
										<Col>
											<Form.Label className="mb-3">
												Select Your Flavor
											</Form.Label>
											<Form.Select
												className="mb-3"
												aria-label="Select Flavor"
												onChange={(e) => {
													setFlavor(e.target.value);
												}}
											>
												<option value="">
													Select flavor here
												</option>
												<option value="Chicken Tikka">
													Chicken Tikka
												</option>
												<option value="PeriPeri Pizza">
													PeriPeri Pizza
												</option>
												<option value="Raspberry Dessert Pizza">
													Raspberry Dessert Pizza
												</option>
												<option value="Chicken Alfredo Pizza">
													Chicken Alfredo Pizza
												</option>
												<option value="Sunchoke Pizza">
													Sunchoke Pizza
												</option>
												<option value="Buffalo Chicken Sticks">
													Buffalo Chicken Sticks
												</option>
											</Form.Select>
										</Col>
										<Col>
											<Form.Label className="mb-3">
												Select Size
											</Form.Label>
											<Form.Select
												aria-label="select size"
												className="mb-3"
												onChange={(e) => {
													handleSize(e);
												}}
											>
												<option value="">
													Select size here
												</option>
												<option value="large">
													Large -- 2.0 ALGO
												</option>
												<option value="medium">
													Medium -- 1.5 ALGO
												</option>
												<option value="small">
													Small -- 1.0 ALGO
												</option>
											</Form.Select>
										</Col>
									</Row>
									<Row>
										<Col>
											<Form.Label className="mb-3">
												Choose your favorite Crust!
											</Form.Label>
											<Form.Select
												aria-label="Select crust"
												className="mb-3"
												onChange={(e) => {
													handleCrust(e);
												}}
											>
												<option value="">
													Select your preferred crust!
												</option>
												<option value="Crispy">
													Crispy -- 0.5 ALGO
												</option>
												<option value="Stuffed">
													Stuffed -- 0.5 ALGO
												</option>
												<option value="Gluten-free">
													Gluten-free-- 0.3 ALGO
												</option>
											</Form.Select>
										</Col>
										<Col>
											<Form.Label className="mb-3">
												Select Your Toppings at 0.1 ALGO
												each
											</Form.Label>
											<br />
											{toppings.map((name, index) => {
												return (
													<Form.Check
														key={index}
														onChange={() => {
															handleToppings(
																index
															);
														}}
														inline
														label={name}
														name="toppings"
														type="checkbox"
														checked={
															checkedState[index]
														}
														id={name}
													/>
												);
											})}
										</Col>
									</Row>
									<Row>
										<Col>
											<Form.Label className="mb-3">
												Enter Name
											</Form.Label>
											<Form.Control
												type="text"
												onChange={(e) => {
													setName(e.target.value);
												}}
												className="mb-3"
												placeholder="Name"
											/>
										</Col>
										<Col>
											<Form.Label className="mb-3">
												Enter Phone Number
											</Form.Label>
											<Form.Control
												type="tel"
												onChange={(e) => {
													setNumber(e.target.value);
												}}
												className="mb-3"
												placeholder="+1-(012)-3456789"
											/>
										</Col>
									</Row>
									<Row>
										<Col>
											<Form.Label className="mb-3">
												Enter Location
											</Form.Label>
											<Form.Control
												type="text"
												onChange={(e) => {
													setLocation(e.target.value);
												}}
												className="mb-3"
												placeholder="Location"
											/>
										</Col>
									</Row>

									<Button
										variant="success"
										size="lg"
										disabled={!isFormFilled()}
										onClick={() => {
											startOrderTxn();
										}}
									>
										Checkout Total of {total} Algo
									</Button>
									<br />
								</Form>
							) : (
								<>
									<Loader />
								</>
							)}
						</div>
						<div className="col-sm-7">
							<div
								id="information"
								style={{
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								{!loading ? (
									orderStatus === 0 ? (
										<>
											<i className="bi bi-info-circle-fill"></i>
											<p>
												Your order will be processed and
												delivered within one hour of
												placing.
											</p>
											<p>
												Incase of any comment of
												complaint, Please reach out to
												us as fast as possible.
											</p>
											<p id="regards">
												Regards, Management
											</p>
										</>
									) : orderStatus === 1 ? (
										<>
											<i className="bi bi-check-square-fill"></i>
											<p>
												Hello {name}, We have recieved
												your order and it will be
												delivered to you at {location}{" "}
												thanks for ordering at PizzaPap
											</p>
											<p id="regards">
												Regards, Management
											</p>
										</>
									) : (
										<>
											<i className="bi bi-x-circle-fill"></i>
											<p>
												Sorry {name} order not placed
												successfully please try again.
											</p>
										</>
									)
								) : (
									<>
										<i className="bi bi-wallet2"></i>
										<p>Please confirm payment on wallet</p>
									</>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

PlaceOrder.propTypes = {
	createOrder: PropTypes.func.isRequired,
	orderStatus: PropTypes.number.isRequired,
	loading: PropTypes.bool.isRequired,
};

export default PlaceOrder;
