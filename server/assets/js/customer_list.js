app.component("customer-list",{
  template:`
  

<div class="row mb-3" style="margin: 15px;">
                  <label for="inputText" class="col-sm-2 col-form-label">Filter users</label>
                  <div class="col-sm-10" >
                    <input type="text" v-model="qr" @input="getClients"  class="form-control">
                  </div>
                </div>

  `,
  data: function(){
    return{
      title:"It Works!"
    }
  },
  methods:{
          filterResults(items) {
           results = items.filter(item => {
                return item.business_name.toLowerCase().indexOf(search.toLowerCase()) > -1})
            return(results);
          },

        async getClients(){
          let res = await fetch(ajax_customers+this.qr);
          let data = await res.json();
          search = "";
          let items = data;
          this.results = this.filterResults(items);
          this.isOpen = true;
          console.log(this.results)
          console.log(results)
          return(results)
        }
      },
})
