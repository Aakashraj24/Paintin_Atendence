myData = [
    { "date": "2026-02-12T00:00:00Z", "atd": 1, "adv": 0 },
    { "date": "2026-02-13T00:00:00Z", "atd": 0, "adv": 0 },
    { "date": "2026-02-14T00:00:00Z", "atd": 1, "adv": 0 },
    { "date": "2026-03-15T00:00:00Z", "atd": 0, "adv": 0 },
    { "date": "2026-02-16T00:00:00Z", "atd": 1, "adv": 0 },
    { "date": "2026-02-17T00:00:00Z", "atd": 1, "adv": 1500 },
    { "date": "2026-02-18T00:00:00Z", "atd": 1, "adv": 0 },
    { "date": "2026-02-19T00:00:00Z", "atd": 0.5, "adv": 0 },
    { "date": "2026-02-20T00:00:00Z", "atd": 1, "adv": 0 },
    { "date": "2026-02-21T00:00:00Z", "atd": 1, "adv": 0 },
    { "date": "2026-02-22T00:00:00Z", "atd": 1, "adv": 0 },
    { "date": "2026-02-23T00:00:00Z", "atd": 1, "adv": 0 },
    { "date": "2026-02-24T00:00:00Z", "atd": 1, "adv": 2000 },
    { "date": "2026-02-25T00:00:00Z", "atd": 1, "adv": 0 },
    { "date": "2026-02-26T00:00:00Z", "atd": 1, "adv": 0 },
    { "date": "2026-02-27T00:00:00Z", "atd": 1, "adv": 3000 },
    { "date": "2026-02-28T00:00:00Z", "atd": 1, "adv": 0 },
    { "date": "2026-03-01T00:00:00Z", "atd": 1, "adv": 0 },
    { "date": "2026-03-02T00:00:00Z", "atd": 1, "adv": 0 },
    { "date": "2026-03-03T00:00:00Z", "atd": 0, "adv": 1000 }
    
    
]

function getFormatedDate(year, month, date) {
    months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Satarday"]
    let dt = new Date(year, month, date)
    let dy = dt.getDay()
    let dd = dt.getDate()
    if (dd < 10) { dd = '0' + dd }
    let mm = dt.getMonth() + 1
    if (mm < 10) { mm = '0' + mm }
    let yy = dt.getFullYear()
    let day = days[dy]
    month_ = months[dt.getMonth()]
    date = `${dd}-${mm}-${yy} : ${day} ${dd} ${month_} ${yy} : ${dd} ${month_.slice(0,3)} ${day.slice(0,3)}`
    time = dt.toDateString()
    return date
}

function genrate_file_name(author){
    author = author ? author : "Documents"
    dt = new Date()
    dd = dt.getDate() < 10 ? ("0" + dt.getDate()) : dt.getDate()
    _mm = dt.getMonth()
    mn = _mm + 1 < 10 ? "0" + _mm : _mm
    yy = dt.getFullYear()
    hh = dt.getHours() > 12 ? dt.getHours() - 12 : dt.getHours()
    hh = dt.getHours() < 10 ?  "0" + dt.getHours() : dt.getHours()
    mm = dt.getMinutes() < 10 ? "0" + dt.getMinutes() : dt.getMinutes()
    ss = dt.getSeconds() < 10 ? "0" + dt.getSeconds() : dt.getSeconds()
    return `${author}_${dd}_${mn}_${yy}_${hh}_${mm}_${ss}.png`
}

console.log(genrate_file_name("Aakash_Rajbhar"))
function json_to_table_data(jsonList) {
    head = `<tr><th>Date</th><th>Attendence</th><th>Advance</th><th>Available</th></tr>`
    total_available = 0
    total_advance = 0
    total_atendece = 0
    table_body = ""
    space = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
    
    // Extracting all data vi for_of_loop
    for (let value of myData) {
        dt = value["date"].split("T")[0]
        dtc = getFormatedDate(parseInt(dt.split("-")[0]),parseInt(dt.split("-")[1])-1,parseInt(dt.split("-")[2]))
        atd = value["atd"]
        adv = value["adv"]
        total_atendece += atd
        total_available += parseFloat(atd) * 700
        total_advance += adv
        tds = ""
        if (atd == 0 && adv == 0) {
            tds = `<tr><td class="date" width="20%">${dtc.split(" : ")[2]}</td><td class="atd">--</td><td class="adv">---</td><td class="available">---</td></tr>`
        } else if(atd == 0 && adv != 0) {
            tds = `<tr><td class="date" width="20%">${dtc.split(" : ")[2]}</td><td class="atd">${atd}</td><td class="adv">---</td><td class="available">₹${total_available}</td></tr>`
        } else {
            tds = `<tr><td class="date" width="20%">${dtc.split(" : ")[2]}</td><td class="atd">${atd}</td><td class="adv">${adv = adv ? "₹"+adv : "---"}</td><td class="available">₹${total_available}</td></tr>`
        }
        table_body += tds
        }
    footer = `<tr><th>Total</th><th>${total_atendece}</th><th>₹${total_advance}</th><th>₹${total_available}</th></tr>`
    final = `<tr><th>Final</th><th colspan="2">₹${total_available} ${space} - ${space} ₹${total_advance}</th><th>₹${total_available - total_advance}</th></tr>`
    table_body += footer
    table_body += final
    return head + table_body
}

table = document.querySelector('table').innerHTML = json_to_table_data(myData)

// downlod hajiri image
function downloadImage() {
    const element = document.querySelector(".table-card");
    html2canvas(element,{scale: 12,allowTaint: true,useCORS: true,logging: false}).then(canvas => {
        const link = document.createElement("a");
        link.download = genrate_file_name();
        link.href = canvas.toDataURL("image/png");
        link.click();
    });
}
