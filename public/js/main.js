// FRONT-END (CLIENT) JAVASCRIPT HERE
let ul = null //null reference to ul, need to load the page before manipulating stuff in the DOM, want global scope so all fns can access
const list = null
const submit = async function( event ) { //submit function
  // stop form submission from trying to load
  // a new .html page for displaying results...
  // this was the original browser behavior and still
  // remains to this day
  event.preventDefault()
  
  const item = document.querySelector( '#additem' ),
        count = document.querySelector( '#addcount' ),
        cost = document.querySelector( '#addcost' )
  
  const fieldsEmpty = item.value === "" || count.value === "" || cost.value === ""
  const json = { _id: crypto.randomUUID(), item: item.value, count: count.value, cost: cost.value }//attach ID as this is constructed, get it from the server?
        body = JSON.stringify( json )
     
  console.log(json)
  if(!fieldsEmpty){
      const response = await fetch( '/submit', {
      method:'POST',
      body 
    })
    const success = await response.json()
    if(!success.acknowledged){
      console.log("Insertion Error!")
    }
  } else {
    console.log("Fields are empty!") //do frontend warning here later!!!
  }
  const getresponse = await fetch('/getlist', {method: 'GET'})
    shoplist = await getresponse.json()
    loadList(shoplist)
  //add onto things here
  //console.log( arr ) //can run json parse here
  //loadList(arr)
}

const deleteEntry = async function(id){
  json = {_id: id}
  body = JSON.stringify(json)
  console.log("deleteEntry called")
  const success = await fetch('/delete', {method:'POST', body})
  console.log(success)
  if(!success.status === 200){
    console.log("Deletion Error!")
  } 
  const getresponse = await fetch('/getlist', {method: 'GET'})
    shoplist = await getresponse.json()
    loadList(shoplist)
}
const addmode = async function( event ){
  event.preventDefault
  document.querySelector("#addmodebtn").className = "selectedbtn"
  document.querySelector("#modifymodebtn").className = "unselectedbtn"
  document.querySelector("#addelems").hidden = false
  document.querySelector("#modifyelems").hidden = true
}
const modmode = async function( event ){
  event.preventDefault
  document.querySelector("#addmodebtn").className = "unselectedbtn"
  document.querySelector("#modifymodebtn").className = "selectedbtn"
  document.querySelector("#addelems").hidden = true
  document.querySelector("#modifyelems").hidden = false
}

const loadList = function(arr){
  ul.innerHTML = ''
  selector = document.querySelector('#moddropdown')
  selector.innerHTML = '<option value="">Select an Item</option>'
  total = 0
  for (let i of arr){
    //console.log(i)
    if(i.item === ''){
      continue
    }
      const li = document.createElement( 'li' )
      li.className = "listli"
      li.innerText = i.item + " x " + i.count + " = $" + (i.cost * i.count)//this updates
      ul.appendChild( li )
      const delbutton = document.createElement( 'button' )
      delbutton.id = i._id
      delbutton.className = "itembutton"
      delbutton.innerText = "X"
      delbutton.onclick = function(event){
        event.preventDefault()
        deleteEntry(delbutton.id)
      }
      //delbutton.onclick = delete(id) how to implement? async with param
      li.appendChild(delbutton)
      total += (i.count * i.cost)
      modOption = document.createElement( 'option' )
      modOption.innerText = i.item + " x " + i.count + " = $" + (i.cost * i.count)
      modOption.id = i._id
      modOption.value = i.item + " x " + i.count + " = $" + (i.cost * i.count)
      selector.appendChild(modOption)
  }
  tdisp = document.getElementById('tdisp')
  tdisp.innerText = 'Total is ' + total + "$"
  tdisp.hidden = false
}

window.onload = async function() {
  const submitbutton = document.querySelector('#submitadd')
  submitbutton.onclick = submit
  const addmodebtn = document.querySelector('#addmodebtn')
  addmodebtn.onclick = addmode 
  const modmodebtn = document.querySelector('#modifymodebtn')
  modmodebtn.onclick = modmode 
  ul = document.createElement( 'ul')
  ul.id = 'mainlist'
  document.body.appendChild( ul )
  const response = await fetch('/getlist', {method: 'GET'})
  shoplist = await response.json()
  loadList(shoplist)
}
