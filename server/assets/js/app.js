// let app = Vue.createApp({
//       // template: "<h1>Hello {{ name }}</h1>",
//       // el: '#app',
//       data(){
//         return {  
//           dp:"/assets/imsg/profile-img.jpg",
//           username:username,  results: [],
//           isOpen: false,  logout_url: logout_url,
//           is_logged_in: is_logged_in,
//            products_url:products_url,
//             number_of_sales:number_of_sales,
//             total_sales:total_sales,
//             numberOfProducts:0,
//         }
//       },
//       mounted:function(){
//         this.getAllClients();
//         this.getPanelData_products();
//         this.getTotalSales();

//       },
//       components: ['customer-list'],
//       methods:{
//         async getPanelData_products(){
//           console.clear();
//         let res = await fetch(products_url);
//         let items = await res.json();
//         console.log('====================================');
//         console.log(items.number_of_products);
//         console.log('====================================');
//         this.numberOfProducts = items;
//         return
//       },
//       async getTotalSales(){
//         console.clear();
//       let res = await fetch(total_sales);
//       let salesObject = await res.json();
//       salesValue = salesObject.total
//       this.total_sales = numberWithCommas(salesValue);
//       return
//     },
//         addAClient(){
//           return "window.location('/')";
//         },
//           filterResults(items) {
//            results = items.filter(item => {
//                 return item.label.toLowerCase().indexOf(search.toLowerCase()) > -1})
//             return(results);
//           },

//         async getData(){
//           let res = await fetch(autocomplete+this.qr);
//           let data = await res.json();
//           search = "";
//           let items = data;
//           this.results = this.filterResults(items);
//           this.isOpen = true;
//           console.log(results)
//         },

//           filterWatejs(items) {
//            results = items.filter(item => {
//                 return item.business_name.toLowerCase().indexOf(search.toLowerCase()) > -1})
//             return(results);
//           },

//         async getClients(){
//           let res = await fetch(ajax_customers+this.qr);
//           let data = await res.json();
//           search = "";
//           let items = data;
//           this.results = this.filterWatejs(items);
//           this.WatejaWamerudi = true;
//           console.log(this.results)
//           console.log(results)
//           return(results)
//         },
        
//         async getAllClients(){
//           let res = await fetch(all_ajax_customers);
//           let data = await res.json();
//           search = "";
//           let items = data;
//           this.results = this.filterWatejs(items);
//           this.WatejaWote = true;
//           console.log(this.results)
//           console.log(results)
//           return(results)
//         }
//       },

//     })
