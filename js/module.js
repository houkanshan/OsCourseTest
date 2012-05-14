function Event(name) {
    var handlers = [];
    //可以支持一个事件, 注册多个响应函数
    //而且随时注册.

    this.getName = function () {
        return name;
    };

    this.addHandler = function (handler) {
        handlers.push(handler);
    };

    this.removeHandler = function (handler) {
        for (var i = 0; i < handlers.length; i++) {
            if (handlers[i] == handler) {
                handlers.splice(i, 1);
                break;
            }
        }
    };

    this.fire = function (eventArgs) {
        handlers.forEach(function (h) {
            h(eventArgs);
        });
    };
}

//订阅和发布事件
function EventAggregator() {
    var events = [];

    function getEvent(eventName) {
        return $.grep(events, function (event) {
            return event.getName() === eventName;
        })[0];
        //返回数组,而且还只取第一个~
    }

    this.publish = function (eventName, eventArgs)  {
        var event = getEvent(eventName);

        if (!event) {
            event = new Event(eventName);
            events.push(event);
        }
        event.fire(eventArgs);
    };

    this.subscribe = function (eventName, handler) {
        var event = getEvent(eventName);

        if (!event) {
            event = new Event(eventName);
            events.push(event);
        }

        event.addHandler(handler);
    };
}


//===========================================
function Product(id, description) {
    this.getId = function () {
        return id;
    };
    this.getDescription = function () {
        return description;
    };
}


function Cart(eventAggregator) {
    var items = [];

    this.addItem = function (item) {
        items.push(item);
        eventAggregator.publish("itemAdded", item);
    };
}

//相当于socket的socket.on, 但是这里只支持一个参数,
function CartController(cart, eventAggregator) {
    eventAggregator.subscribe("itemAdded", function (eventArgs) {
        var newItem = $('<li></li>').html(eventArgs.getDescription()).attr('id-cart', eventArgs.getId()).appendTo("#cart");
    });

    eventAggregator.subscribe("productSelected", function (eventArgs) {
        cart.addItem(eventArgs.product);
    });
}

function ProductRepository() {
    var products = [new Product(1, "Star Wars Lego Ship"),
            new Product(2, "Barbie Doll"),
            new Product(3, "Remote Control Airplane")];

    this.getProducts = function () {
        return products;
    };
}

function ProductController(eventAggregator, productRepository) {
    var products = productRepository.getProducts();

    function onProductSelected() {
        var productId = $(this).attr('id');
        var product = $.grep(products, function (x) {
            return x.getId() == productId;
        })[0];
        eventAggregator.publish("productSelected", {
            product: product
        });
    }

    products.forEach(function (product) {
        var newItem = $('<li></li>').html(product.getDescription())
                                    .attr('id', product.getId())
                                    .dblclick(onProductSelected)
                                    //在这里绑定了事件.
                                    .appendTo("#products");
    });
}


(function () {
    var eventAggregator = new EventAggregator(),
    cart = new Cart(eventAggregator),
    //提供一个参数实际上是将事件注册进去了.
    cartController = new CartController(cart, eventAggregator),
    //
    productRepository = new ProductRepository(),
    productController = new ProductController(eventAggregator, productRepository);
})();


//确实是一种通信机制, 因为可以看到通常是子元素被创建或者被添加,然后触发父元素的Hander
//
//? 有没有一个事件多个触发?