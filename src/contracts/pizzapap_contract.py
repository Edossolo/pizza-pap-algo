from pyteal import *


class Pizza:
    pizza_pap = Addr(
        "KEQ7JW4KCRSHVVJTC5IG26LX2GHR7ZCUWQCC2AASKGDI35WLPJMFQLIIWQ")

    class Variables:
        flavor = Bytes("FLAVOR")
        size = Bytes("SIZE")
        crust = Bytes("CRUST")
        toppings = Bytes("TOPPINGS")
        name = Bytes("NAME")
        phonenumber = Bytes("NUMBER")
        location = Bytes("LOCATION")
        total = Bytes("TOTAL")
        order_status = Bytes("STATUS")

    class AppMethods:
        confirm = Bytes("confirm")

    def application_creation(self):
        size = Txn.application_args[1]
        crust = Txn.application_args[2]
        price = ScratchVar(TealType.uint64)
        toppings = Txn.application_args[3]
        return Seq([
            price.store(Int(0)),
            Cond([size == Bytes("large"), price.store(price.load() + Int(2000000))],
                 [size == Bytes("medium"), price.store(price.load() + Int(1500000))],
                 [size == Bytes("small"), price.store(price.load() + Int(1000000))],
            ),
            Cond([crust == Bytes("Crispy"), price.store(price.load() + Int(500000))],
                 [crust == Bytes("Stuffed"), price.store(price.load() + Int(500000))],
                 [crust == Bytes("Gluten-free"), price.store(price.load() + Int(300000))]
            ),
            Cond([Len(toppings) == Int(0), price.store(price.load() + Int(0))],
                 [Len(toppings) == Int(7), price.store(price.load() + Int(100000))],
                 [Len(toppings) == Int(14), price.store(price.load() + Int(200000))],
                 [Len(toppings) == Int(24), price.store(price.load() + Int(300000))]
            ),
            Assert(
                And(
                    # check that group contains two transactions
                    Global.group_size() == Int(2),
                    # check that this transaction is the first
                    Txn.group_index() == Int(0),
                    # check note attached is valid
                    Txn.note() == Bytes("pizza-pap:uv1"),
                    # check that the number of args is equal to 8
                    Txn.application_args.length() == Int(8),
                    # check that the total amount is equal to the price calculated for ordering the pizza
                    Btoi(Txn.application_args[7]) == price.load(),
                    # checks for the payment transaction, being made to pizza_pap address
                    Gtxn[1].type_enum() == TxnType.Payment,
                    Gtxn[1].receiver() == self.pizza_pap,
                    Gtxn[1].amount() == Btoi(Txn.application_args[7]),
                    Gtxn[1].sender() == Gtxn[0].sender(),

                )
            ),
            # set variables
            App.globalPut(self.Variables.flavor, Txn.application_args[0]),
            App.globalPut(self.Variables.size, Txn.application_args[1]),
            App.globalPut(self.Variables.crust, Txn.application_args[2]),
            App.globalPut(self.Variables.toppings, Txn.application_args[3]),
            App.globalPut(self.Variables.name, Txn.application_args[4]),
            App.globalPut(self.Variables.phonenumber, Txn.application_args[5]),
            App.globalPut(self.Variables.location, Txn.application_args[6]),
            App.globalPut(self.Variables.total, Btoi(Txn.application_args[7])),
            App.globalPut(self.Variables.order_status, Int(0)),
            Approve()
        ])

    def confirm_order(self):
        return Seq([
            Assert(
                And(
                    # check that transaction sender is creator of pizza order
                    Txn.sender() == Global.creator_address(),
                    # check that status is not yet confirmed
                    App.globalGet(self.Variables.order_status) == Int(0),
                )
            ),
            # set status as confirmed
            App.globalPut(self.Variables.order_status, Int(1)),
            Approve()
        ])

    def application_deletion(self):
        return Return(Txn.sender() == Global.creator_address())

    def application_start(self):
        return Cond(
            [Txn.application_id() == Int(0), self.application_creation()],
            [Txn.on_completion() == OnComplete.DeleteApplication,
             self.application_deletion()],
            [Txn.application_args[0] == self.AppMethods.confirm, self.confirm_order()]
        )

    def approval_program(self):
        return self.application_start()

    def clear_program(self):
        return Return(Int(1))
