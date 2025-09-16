const btn = document.getElementById("btn")

id = 1

btn.addEventListener("click", ()=>{

    const keyword = document.getElementById("entry").value

    fetch("http://127.0.0.1:5000/API/resources",{
        method: "POST",
        headers:{
            "Content-Type": "application/json"
        },
        body: JSON.stringify({keyword, id})


    })
});