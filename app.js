const webstore = new Vue({
    el: '#app',
    data: {
        sitename: 'PetDepot',
        currentPage: 'browse',
        filter: '',
        products: [],
        order: {
            sendGift: 'Send As A Gift',
            dontSendGift: 'Don\'t Send As A Gift',
            
            products: [],
            firstName: '',
            lastName: '',
            address: '',
            city: '',
            state: '',
            zip: '',
            method: 'Home',
            gift: false,
        },

        states: {
            AL: 'Alabama',
            AR: 'Arizona',
            CA: 'California',
            NV: 'Nevada',
        },
    },
    methods: {
        addToCart: function(product) {
            this.order.products.push(product.id);
        },
        removeFromCart: function(product) {
            const newCart = [];

            this.order.products.forEach((productId, index) => {
                if (productId !== product.id) newCart.push(productId);
            });

            this.order.products = newCart;
        },
        increaseProductQty: function(product) {
            if (product.inventory - this.cartProductCount(product.id) === 0) {
                alert('Out of stock!');
                return;
            }

            this.order.products.push(product.id);
        },
        decreaseProductQty: function(product) {
            if (this.cartProductCount(product.id) === 0) {
                alert('Product is not in cart!');
                return;
            }
            
            this.order.products.splice(this.order.products.indexOf(product.id), 1);
        },
        submitForm: function() {
            alert('Form Submitted');
        },
        cartProductCount: function(id) {
            return this.order.products.filter(cartId => cartId === id).length;
        }
    },
    computed: {
        sortedProducts() {
            const productsArray = this.products.slice(0);
            function compare(a, b) {
                if (a.price > b.price)
                    return 1;
                else if (a.price < b.price)
                    return -1;
                return 0;
            }
            return productsArray.sort(compare);
        },
        productsInCart() {
            const cartIds = [...new Set(this.order.products)];
            const cartProducts = this.products.filter(product => cartIds.includes(product.id));
            return cartProducts;
        },
        cartTotalPrice() {
            let total = 0;
            let productIdToPrice = {};
            this.order.products.forEach(productId => {
                if (!productIdToPrice[productId]) {
                    productIdToPrice[productId] = this.products.find(product => product.id === productId);
                }

                total += productIdToPrice[productId].price;
            });

            return total;
        },
        checkoutFormIsValid() {
            let valid = true;
            ['firstName', 'lastName', 'address', 'city', 'state', 'zip'].forEach(field => {
                if (this.order[field] === '') valid = false;
            });
            return valid;
        }
    }
});

const routes = ['browse', 'checkout'];

window.onload = function() {
    products.forEach(product => {
        webstore.products.push(
            getproductstructure(product)
        );
    });
}

function getproductstructure(dataObject) {
    return {
        id: 0,
        picture: '',
        name: '',
        description: '',
        rating: 0,
        price: 0,
        inventory: 0,
        ...dataObject
    }
};