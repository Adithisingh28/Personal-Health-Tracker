/* =====================================================
   PERSONAL HEALTH TRACKER
   ===================================================== */

let records = [];
let sugarChart = null;


/* =====================================================
   LOAD SAVED RECORDS
   ===================================================== */

try {
    const savedRecords = localStorage.getItem("healthRecords");

    if (savedRecords) {
        records = JSON.parse(savedRecords);
    }

    if (!Array.isArray(records)) {
        records = [];
    }

} catch (error) {
    console.log("No previous records found.");
    records = [];
}


/* =====================================================
   ADD NEW RECORD
   ===================================================== */

function addNewRecord() {
    clearForm();
    document.getElementById("date").focus();
}


/* =====================================================
   SAVE RECORD
   ===================================================== */

function saveRecord() {

    const date = document.getElementById("date").value;

    const sugarBefore =
        document.getElementById("sugarBefore").value;

    const bpMorning =
        document.getElementById("bpMorning").value.trim();


    if (!date) {
        alert("Please select a date.");
        return;
    }


    if (sugarBefore === "" && bpMorning === "") {
        alert("Please enter at least one health reading.");
        return;
    }


    const record = {
        date: date,
        sugarBefore: sugarBefore,
        bpMorning: bpMorning
    };


    records.push(record);


    records.sort(function (a, b) {
        return new Date(a.date) - new Date(b.date);
    });


    localStorage.setItem(
        "healthRecords",
        JSON.stringify(records)
    );


    displayRecords();
    updateSummary();
    updateChart();
    clearForm();


    alert("Record saved successfully!");
}


/* =====================================================
   CLEAR FORM
   ===================================================== */

function clearForm() {

    document.getElementById("date").value = "";

    document.getElementById("sugarBefore").value = "";

    document.getElementById("bpMorning").value = "";
}


/* =====================================================
   DISPLAY RECORDS
   ===================================================== */

function displayRecords() {

    const table =
        document.getElementById("recordsTable");

    table.innerHTML = "";


    if (records.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="4">
                    No records yet.
                    Add your first health record above.
                </td>
            </tr>
        `;

    } else {

        records.forEach(function (record, index) {

            const row =
                document.createElement("tr");


            row.innerHTML = `
                <td>
                    ${formatDate(record.date)}
                </td>

                <td>
                    ${record.sugarBefore || "-"}
                </td>

                <td>
                    ${record.bpMorning || "-"}
                </td>

                <td>
                    <button
                        class="delete-btn"
                        onclick="deleteRecord(${index})"
                    >
                        Delete
                    </button>
                </td>
            `;


            table.appendChild(row);
        });
    }


    document.getElementById(
        "recordCount"
    ).textContent = records.length;
}


/* =====================================================
   UPDATE SUMMARY CARDS
   ===================================================== */

function updateSummary() {

    const recordCount =
        document.getElementById("summaryRecords");

    const latestSugar =
        document.getElementById("summarySugar");

    const latestBP =
        document.getElementById("summaryBP");


    recordCount.textContent = records.length;


    if (records.length === 0) {

        latestSugar.textContent = "--";
        latestBP.textContent = "--";

        return;
    }


    const latest =
        records[records.length - 1];


    if (latest.sugarBefore) {

        latestSugar.textContent =
            latest.sugarBefore + " mg/dL";

    } else {

        latestSugar.textContent = "--";
    }


    if (latest.bpMorning) {

        latestBP.textContent =
            latest.bpMorning;

    } else {

        latestBP.textContent = "--";
    }
}


/* =====================================================
   FORMAT DATE
   ===================================================== */

function formatDate(dateString) {

    if (!dateString) {
        return "-";
    }


    const date =
        new Date(dateString + "T00:00:00");


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


/* =====================================================
   DELETE RECORD
   ===================================================== */

function deleteRecord(index) {

    const confirmation =
        confirm(
            "Are you sure you want to delete this record?"
        );


    if (!confirmation) {
        return;
    }


    records.splice(index, 1);


    localStorage.setItem(
        "healthRecords",
        JSON.stringify(records)
    );


    displayRecords();
    updateSummary();
    updateChart();
}


/* =====================================================
   SUGAR CHART
   ===================================================== */

function updateChart() {

    const canvas =
        document.getElementById("sugarChart");


    if (!canvas) {
        return;
    }


    if (typeof Chart === "undefined") {
        return;
    }


    const ctx =
        canvas.getContext("2d");


    const labels =
        records.map(function (record) {
            return formatDate(record.date);
        });


    const sugarBefore =
        records.map(function (record) {

            return record.sugarBefore
                ? Number(record.sugarBefore)
                : null;

        });


    if (sugarChart) {
        sugarChart.destroy();
    }


    sugarChart = new Chart(
        ctx,
        {
            type: "line",

            data: {

                labels: labels,

                datasets: [
                    {
                        label: "Sugar Before Food",

                        data: sugarBefore,

                        borderColor: "#789b7d",

                        backgroundColor:
                            "rgba(120, 155, 125, 0.12)",

                        borderWidth: 3,

                        pointRadius: 4,

                        pointHoverRadius: 6,

                        fill: true,

                        tension: 0.3,

                        spanGaps: true
                    }
                ]
            },


            options: {

                responsive: true,

                maintainAspectRatio: false,


                plugins: {

                    legend: {
                        display: true
                    }
                },


                scales: {

                    y: {

                        beginAtZero: false,

                        title: {
                            display: true,
                            text: "Sugar (mg/dL)"
                        }
                    },


                    x: {

                        title: {
                            display: true,
                            text: "Date"
                        }
                    }
                }
            }
        }
    );
}


/* =====================================================
   DOWNLOAD CSV
   ===================================================== */

function downloadCSV() {

    if (records.length === 0) {

        alert(
            "There are no records to download."
        );

        return;
    }


    let csv =
        "Date,Sugar Before Food,BP Morning\n";


    records.forEach(function (record) {

        csv +=
            `"${record.date}",` +
            `"${record.sugarBefore || ""}",` +
            `"${record.bpMorning || ""}"\n`;

    });


    const blob =
        new Blob(
            [csv],
            {
                type: "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;


    link.download =
        "Personal_Health_Records.csv";


    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);


    URL.revokeObjectURL(url);
}


/* =====================================================
   PRINT RECORDS
   ===================================================== */

function printRecords() {

    if (records.length === 0) {

        alert(
            "There are no records to print."
        );

        return;
    }


    window.print();
}


/* =====================================================
   PAGE LOAD
   ===================================================== */

displayRecords();

updateSummary();

updateChart();