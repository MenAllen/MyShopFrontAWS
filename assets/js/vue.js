// data

// Accès AWS beanstalk
const ADDRAWS = "http://expapp1-env-1.eba-fsdqt3z6.us-east-2.elasticbeanstalk.com/";

// =========================================================================================================
//															Fonction	en Attente
// =========================================================================================================

const Home = {
	template: "<h1>Home</h1>",
	name: "Home",
};

// =========================================================================================================
//															Fonctions	Utilisateurs
// =========================================================================================================

const UserSettings = {
	template: "#UserSettings",
	name: "UserSettings",
	data: () => {
		return {
			username: "",
			password: "",
			passwordBis: "",
			email: "",
			status: ""
		};
	},
	created() {
		this.notyf = new Notyf({
			position: {
				x: 'center',
				y: 'top'
			}
		});
  },
	mounted() {
    if(localStorage.status) {
			this.status = localStorage.status;
			document.querySelector(".fa-user").style.color = "rgb(0,128,0)";
			document.querySelector(".fa-plus").style.color = "rgb(0,128,0)";
		} else {
			document.querySelector(".fa-user").style.color = "black";
			document.querySelector(".fa-plus").style.color = "black";
		}
    if(localStorage.username) this.username = localStorage.username;
    if(localStorage.isAdmin) this.isAdmin = localStorage.isAdmin;
    if(localStorage.email) this.email = localStorage.email;
  },
	methods: {
		// signin: Connection et récupération des infos du username dans localStorage
		signin() {
			axios.post(ADDRAWS + "api/user/login", {
					username: this.username,
					password: this.password,
				})
				.then((response) => {
					localStorage.setItem("token", response.data.token);
					localStorage.setItem("userId", response.data.userId);
					localStorage.setItem("username", this.username);
					localStorage.setItem("email", response.data.email);					
					localStorage.setItem("isAdmin", response.data.isAdmin);
					localStorage.setItem("status", 'connected');
					this.notyf.success(this.username + " connected");
					document.getElementById("form-signin").reset();
					document.querySelector(".fa-user").style.color = "rgb(0,128,0)";
					this.$router.push("/display-carts");
				})
        .catch(err => {
          this.notyf.error("Connexion failed" + err.response.status + " " + err.response.statusText);
        })
		},
		// signup: Création d'un nouvel user dans la base
    signup() {
      axios.post(ADDRAWS + 'api/user/signup', {
        username: this.username,
        email: this.email,
        password: this.password,
      })
      .then(() => {
				this.notyf.success("User " + this.username + " created");
				document.getElementById("form-signup").reset();
      })
      .catch(err => {
        this.notyf.error("Erreur Signup " + err.response.status);
      })
		},
		signout() {
      axios.post(ADDRAWS + 'api/user/signout', {
        username: this.username
      })
      .then(() => {

				this.notyf.success("User " + this.username + " disconnected");

				this.status = '';
				this.username = '';
				this.email = '';
				localStorage.setItem("status", '');
				localStorage.setItem("token", '');
				localStorage.setItem("userId", '');
				localStorage.setItem("username", '');
				localStorage.setItem("email",'');					
				localStorage.setItem("isAdmin", false);

				document.querySelector(".fa-user").style.color = "black";
				document.querySelector(".fa-plus").style.color = "black";
	
      })
      .catch(err => {

        this.notyf.error("Erreur Signout " + err.response.status);

				this.status = '';
				this.username = '';
				this.email = '';
				localStorage.setItem("status", '');
				localStorage.setItem("token", '');
				localStorage.setItem("userId", '');
				localStorage.setItem("username", '');
				localStorage.setItem("email",'');					
				localStorage.setItem("isAdmin", false);

				document.querySelector(".fa-user").style.color = "black";
				document.querySelector(".fa-plus").style.color = "black";
	
      })
		},
		cancelSignout() {
			this.$router.push("/display-carts");
		},
	},

};

// =========================================================================================================
//															Fonctions	Affichage des articles
// =========================================================================================================

const DisplayCarts = {
	template: "#DisplayCarts",
	name: "DisplayCarts",
	data: () => {
		return {
			products: [],
			searchKey: "",
			liked: []
		};
	},

	created() {

		this.getArticles();
		this.notyf = new Notyf({
			position: {
				x: 'center',
				y: 'top'
			}
		});				
	},

	computed: {
		filteredList() {
			return this.products.filter((product) => {
				return product.articleDescription.toLowerCase().includes(this.searchKey.toLowerCase());
			});
		},
		getLikeCookie() {
			let cookieValue = JSON.parse($cookies.get("like"));
			cookieValue == null ? (this.liked = []) : (this.liked = cookieValue);
		},
	},
	mounted: () => {
		this.getLikeCookie;
	},

	methods: {

	// Permet d'afficher tous les articles
    getArticles() {
			axios.get(ADDRAWS + 'api/article', {
				headers: {
					'Content-Type' : 'application/json',
					'Authorization': 'Bearer ' + localStorage.getItem('token')
				}
			})
			.then(response => { 
				this.products = response.data.results;
				console.log(this.products);
			})
			.catch(err => {
				this.notyf.error("Erreur Display " + err.response.status + " " + err.response.statusText);
			})
		},

		setLikeCookie() {
			setTimeout(() => {
				$cookies.set("like", JSON.stringify(this.liked));
			}, 300);
		},

		deleteArticle(product) {
			let username = localStorage.getItem('username');

			if (username === product.articleUsername) {

				axios.delete(ADDRAWS + 'api/article/' + product.id, {
					headers: {
							'Content-Type' : 'application/json',
							'Authorization': 'Bearer ' + localStorage.getItem('token')
					}
				})
				.then(() => {
					this.notyf.success("Article supprimé");
					this.getArticles();
				})
				.catch(err => {
					this.notyf.error("Echec de suppression");
				})

			} else {
				this.notyf.error("Suppression interdite")
			}
		},
	},
};

// =========================================================================================================
//															Fonctions	Cration d'Articles
// =========================================================================================================

const CreateCard = {
	template: "#CreateCard",
	name: "CreateCard",
	data: () => {
		return {
			titre: '',
			description: '',
			price: 0,
			type: '',
			currentUser: localStorage.username,
			imagePreview: null,
			imagePost: '',
		};
	},
	created() {
		this.notyf = new Notyf({
			position: {
				x: 'center',
				y: 'top'
			}
		});
	},
	methods: {

		uploadFile() {
			this.$refs.fileUpload.click()
		},

		onFileSelected(event) {
			this.imagePost = event.target.files[0];
			this.imagePreview = URL.createObjectURL(this.imagePost);
		}, 

		createArticle() {
			const formData = new FormData();

			formData.append("titre", this.titre);
			formData.append("description", this.description);
			formData.append("price", this.price);
			formData.append("type", this.type);
			formData.append("quantity", 1);			
			formData.append("image", this.imagePost);
			formData.append("username", this.currentUser);			

			axios.post(ADDRAWS + 'api/article', formData, {
					headers: {
							'Content-Type': 'multipart/form-data',
							'Authorization': 'Bearer ' + localStorage.getItem('token')
					}
			})
			.then(() => {
					this.$router.push("/display-carts");
			})
			.catch(err => {
					this.notyf.error("Erreur Create " + err.response.status + " " + err.response.statusText);
					this.$router.push("/display-carts");
			})
		},
		cancelCreateArticle() {
			this.$router.push("/display-carts");
		},
	}
};

// =========================================================================================================
//															Fonctions	gestion Panier
// =========================================================================================================

const ShoppingCart = {
	template: "#ShoppingCart",
	name: "ShoppingCart",

	created() {
		this.notyf = new Notyf({
			position: {
				x: 'center',
				y: 'top'
			}
		});				
	},

	methods: {

		backToShopping() {
			this.$router.push("/display-carts");
		},

		processOrder(totalprice) {

			if (totalprice != 0) {
				axios.post(ADDRAWS + 'api/order', {
					username: localStorage.getItem('username'),
					totalprice: totalprice,
					articles: this.$store.state.cart
				},				
				{ headers: {
					'Content-Type' : 'application/json',
					'Authorization': 'Bearer ' + localStorage.getItem('token')
					}
				})
				.then(() => {
					this.notyf.success("Commande transmise")
					this.	$store.commit('removeCart');
					this.$router.push("/display-carts");
				})
				.catch(err => {
					this.notyf.error("Erreur Process Order " + err.response.status + " " + err.response.statusText);
					this.$router.push("/display-carts");
				})
			} else {
				this.notyf.success("Votre paner est vide !")
			}
		},
	}
};

// =========================================================================================================
//															Fonctions	Routage
// =========================================================================================================

const router = new VueRouter({
	routes: [
		{ path: "/", component: Home, name: "Home" },
		{ path: "/user-settings", component: UserSettings, name: "UserSettings" },
		{ path: "/display-carts", component: DisplayCarts, name: "DisplayCarts" },
		{ path: "/create-card", component: CreateCard, name: "CreateCard" },
		{ path: "/shopping-cart", component: ShoppingCart, name: "ShoppingCart" },
	],
});

// =========================================================================================================
//															Fonctions	Store
// =========================================================================================================

const store = new Vuex.Store({
	state: {
			cart: [],
	},

	mutations: {

		addProductToCart(state, product) {

			const duplicatedProductIndex = state.cart.findIndex(item => item.id === product.id);

			if (duplicatedProductIndex !== -1) {
				state.cart[duplicatedProductIndex].articleQuantity++;
				return;
			}

			product.qty = 1;
			state.cart.push(product);
		},

		subProductToCart(state, product) {

			const duplicatedProductIndex = state.cart.findIndex(item => item.id === product.id);

			if (duplicatedProductIndex !== -1) {
				state.cart[duplicatedProductIndex].articleQuantity--;
			}

			if (state.cart[duplicatedProductIndex].articleQuantity === 0) {
				state.cart.splice(duplicatedProductIndex, 1);
			}
		},

		removeProductToCart(state, index) {
			state.cart.splice(index, 1);
		},

		removeCart(state) {
		 state.cart.splice(0, state.cart.length);
		}

	},

	getters: {

    cartTotalAmount(state) {
			let total = 0;
			for (item in state.cart) {
				total = total + (state.cart[item].articleQuantity * state.cart[item].articlePrice);
			}
			return total;
		},

		itemTotalAmount(state) {
			let itemTotal = 0;
			for (item in state.cart) {
				itemTotal = itemTotal + state.cart[item].articleQuantity;
			}
			return itemTotal;
		},

		idTotalAmount: (state) => (id) => {			
			return state.cart[id].articleQuantity * state.cart[id].articlePrice;
		},

	}	
});

// =========================================================================================================
//															Main Vue
// =========================================================================================================

const vue = new Vue({
	router,
	store,
}).$mount("#app");
