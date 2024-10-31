const webstore = new Vue({
    el: '#app',
    data: {
        sitename: 'PetDepot',
        currentPage: 'browse',
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