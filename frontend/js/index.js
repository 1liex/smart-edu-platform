const btn = document.getElementById("btn")
const btndata =document.getElementById("data")

id = 2
token = "kTXwfT8J01AM#O3"

btn.addEventListener("click", ()=>{

    const keyword = document.getElementById("entry").value

    fetch("http://127.0.0.1:5000/API/resources",{
        method: "POST",
        headers:{
            "Content-Type": "application/json"
        },
        body: JSON.stringify({token, id, keyword})


    })
});

btndata.addEventListener("click", ()=>{

console.log(name())


});

async function name() {
    const res = await fetch("http://localhost/web_project/backend/php/")
    const data = await res.json()
    return data
}