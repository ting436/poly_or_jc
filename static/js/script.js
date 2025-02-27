document.getElementById("form1").style.display = "block";

// Hide the button in a given form (if needed)
function hideSubmitButton(formId) {
    document.querySelector(`#${formId} button[type="button"]`).style.display = "none";
}

// Save the selected considerations
function saveSelections() {
    let selectedOptions = [];
    document.querySelectorAll("input[name='key_considerations']:checked").forEach((checkbox) => {
        // Store the unique id and the display name
        selectedOptions.push({
            id: checkbox.id,
            name: checkbox.value
        });
    });

    // Save the array to sessionStorage
    sessionStorage.setItem("selectedOptions", JSON.stringify(selectedOptions));

    // Show the ranking form
    document.getElementById("form2").style.display = "block";
    populateRankingOptions();
}

// Populate ranking dropdowns based on selected considerations
function populateRankingOptions() {
    let selectedOptions = JSON.parse(sessionStorage.getItem("selectedOptions")) || [];
    let rankingDiv = document.getElementById("rankingOptions");
    rankingDiv.innerHTML = ""; // Clear previous content

    selectedOptions.forEach(option => {
        // Create label using the display name
        let label = document.createElement("label");
        label.textContent = option.name + ": ";

        // Create select element
        let select = document.createElement("select");
        // Use data attributes to keep the id and name
        select.setAttribute("data-id", option.id);
        select.setAttribute("data-name", option.name);
        // Optionally also set name attribute to the id
        select.name = option.id;

        // Add ranking options from 1 to the total number of selected options
        for (let i = 1; i <= selectedOptions.length; i++) {
            let opt = document.createElement("option");
            opt.value = i;
            opt.textContent = i;
            select.appendChild(opt);
        }

        rankingDiv.appendChild(label);
        rankingDiv.appendChild(select);
        rankingDiv.appendChild(document.createElement("br"));
    });
}

// Save the rankings as an array of objects with id, name, and ranking value
function saveRanking() {
    let rankings = [];
    document.querySelectorAll("#form2 select").forEach(select => {
        let rankingValue = parseInt(select.value, 10);
        let id = select.getAttribute("data-id");
        let name = select.getAttribute("data-name");
        rankings.push({
            id: id,
            name: name,
            value: rankingValue
        });
    });

    // Save the rankings array to sessionStorage
    sessionStorage.setItem("rankings", JSON.stringify(rankings));
    
    // Show the short answer form and populate it based on the rankings
    document.getElementById("form3").style.display = "block";
    populateShortAnswerQuestions();
}

// Create short answer questions based on the saved rankings
function populateShortAnswerQuestions() {
    let rankings = JSON.parse(sessionStorage.getItem("rankings")) || [];
    let shortAnswerDiv = document.getElementById("shortAnswerQuestions");
    shortAnswerDiv.innerHTML = ""; // Clear previous content

    // Sort the rankings array by the ranking value
    rankings.sort((a, b) => a.value - b.value);

    rankings.forEach(item => {
        let label = document.createElement("label");
        label.textContent = item.name + ": ";

        let textArea = document.createElement("textarea");
        // Use the id as the key for explanations
        textArea.name = item.id;
        textArea.rows = 2;
        textArea.cols = 50;
        textArea.placeholder = "Why did you rank this choice like this?";

        shortAnswerDiv.appendChild(label);
        shortAnswerDiv.appendChild(document.createElement("br"));
        shortAnswerDiv.appendChild(textArea);
        shortAnswerDiv.appendChild(document.createElement("br"));
        shortAnswerDiv.appendChild(document.createElement("br"));
    });
}

// Submit the complete form data via AJAX
function submitForm(event) {
    event.preventDefault();

    let formData = {
        key_considerations: JSON.parse(sessionStorage.getItem("selectedOptions")) || [],
        rankings: JSON.parse(sessionStorage.getItem("rankings")) || [],
        explanations: {}
    };

    // Get the explanations keyed by the unique id of each consideration
    document.querySelectorAll("#shortAnswerQuestions textarea").forEach(textarea => {
        formData.explanations[textarea.name] = textarea.value;
    });

    // Get additional personal questions
    formData.interests = document.querySelector("textarea[name='interests']").value;
    formData.l1r5 = document.querySelector("textarea[name='l1r5']").value;
    formData.strengths = document.querySelector("textarea[name='strengths']").value;
    formData.learning_style = document.querySelector("textarea[name='learning_style']").value;
    formData.education_focus = document.querySelector("textarea[name='education_focus']").value;

    // Send data via fetch (AJAX)
    fetch('/api/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        // Optionally, reset the form or redirect the user
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
