// ==UserScript==
// @name         LSS Ausgebildete Wachen ausblenden
// @namespace    www.leitstellenspiel.de
// @version      0.9
// @description  Blende Wachen in der Schule aus, die mehr ausgebildetes Personal haben, als angegeben
// @author       MissSobol
// @match        https://www.leitstellenspiel.de/buildings/*
// @match        https://www.leitstellenspiel.de/schoolings/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const schoolingElement = document.getElementById('schooling');
    const educationForm = document.querySelector('form[action$="/education"]');

    // Überprüfen, ob die korrekten Elemente existiert
    if (!schoolingElement && !educationForm) {
        return;
    }

    if (schoolingElement) {
        // Einfügen eines Eingabefelds, Speichern-Buttons und Löschen-Buttons neben jedem Radio-Element
        const radioElements = document.querySelectorAll('.radio input[type="radio"]');

        for (let i = 0, n = radioElements.length; i < n; i++) {
            // Direktes Lesen des education_key-Attributs vom Radiobutton
            const educationKey = radioElements[i].getAttribute('education_key');

            if (!educationKey) {
                continue;
            }

            const inputElements = createInputElements(educationKey);
            inputElements.classList.add('schooling');
            radioElements[i].parentNode.parentNode.appendChild(inputElements);

            // Eventlistener hinzufügen, um den StoredValue beim Ändern des Radiobuttons zu aktualisieren
            radioElements[i].addEventListener('change', () => {
                // Setzen des StoredValue für den aktiven Radiobutton beim Ändern
                setStoredValueForEducationKey(educationKey);
            });

            // Überprüfen, ob der Radiobutton ausgewählt ist und den zugehörigen StoredValue setzen
            if (radioElements[i].checked) {
                setStoredValueForEducationKey(educationKey);
            }
        }
    } else if (educationForm) {
        // Prüfen ob globalEducationKey existiert
        if (!globalEducationKey) {
            return;
        }

        const inputElements = createInputElements(globalEducationKey);
        const headline = document.createElement('h3');
        headline.textContent = 'Ausgebildete Wachen ausblenden';
        inputElements.classList.add('education');
        inputElements.insertBefore(headline, inputElements.firstChild);
        educationForm.parentNode.insertBefore(inputElements, educationForm);

        setStoredValueForEducationKey(globalEducationKey);
    }

    // Laden und Anzeigen der im Local Storage gespeicherten Zahlen
    loadFromLocalStorage();

    // Überprüfen der Panels in einem Intervall von 500 ms
    setInterval(checkPanels, 500);

    function createInputElements(educationKey) {
        const container = document.createElement('div');
        container.classList.add('education-filter-container');

        const inputField = document.createElement('input');
        inputField.type = 'number';
        inputField.className = 'educationInput';
        inputField.placeholder = 'Min Personal';
        container.append(inputField);

        // Einfügen der Speichern-Button für jedes Radio-Element
        const saveButton = document.createElement('button');
        saveButton.type = 'button';
        saveButton.textContent = 'Speichern';
        saveButton.id = 'saveButton_' + educationKey;
        saveButton.className = 'btn btn-xs btn-success';
        saveButton.addEventListener('click', (event) => {
            event.preventDefault(); // Verhindert das Standardverhalten des Buttons
            saveToLocalStorage(educationKey, inputField.value.trim());
        });
        container.append(saveButton);

        // Einfügen der Löschen-Button für jedes Radio-Element
        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.textContent = 'Löschen';
        deleteButton.id = 'deleteButton_' + educationKey;
        deleteButton.className = 'btn btn-xs btn-danger';
        deleteButton.addEventListener('click', (event) => {
            event.preventDefault(); // Verhindert das Standardverhalten des Buttons
            deleteFromLocalStorage(educationKey);
        });
        container.append(deleteButton);

        return container;
    }

    // Funktion zum Überprüfen der Panels
    function checkPanels() {
        // Überprüfen aller Panel-Elemente
        const panelElements = document.querySelectorAll('#accordion > .panel.panel-default');

        if (panelElements) {
            for (let i = 0, n = panelElements.length; i < n; i++) {
                const labelTextEducated = panelElements[i].textContent.match(/(\d+) ausgebildete Person/);
                const labelTextInEducation = panelElements[i].textContent.match(/(\d+) in Ausbildung/);

                if (labelTextEducated || labelTextInEducation) {
                    let numTrained = 0;

                    if (labelTextEducated) {
                        numTrained += parseInt(labelTextEducated[1]);
                    }

                    if (labelTextInEducation) {
                        numTrained += parseInt(labelTextInEducation[1])
                    }

                    // Ausblenden des Panels, wenn die Bedingung erfüllt ist
                    if (numTrained && isPanelHidden(panelElements[i], numTrained)) {
                        panelElements[i].style.display = 'none';
                    }
                }
            }
        }
    }

    // Funktion zum Überprüfen, ob ein Panel ausgeblendet werden soll
    function isPanelHidden(panel, numTrained) {
        // Ausgewähltes Radio-Element finden
        const selectedRadio = document.querySelector('.radio input[type="radio"]:checked');
        let educationKey;

        if (selectedRadio) {
            educationKey = selectedRadio.getAttribute('education_key');
        } else if (globalEducationKey) {
            educationKey = globalEducationKey;
        } else {
            return false;
        }

        const storedValue = localStorage.getItem(educationKey);
        // Panel ausblenden, wenn NumTrained größer ist als gespeicherter Wert
        return storedValue && numTrained >= parseInt(storedValue);
    }

    // Funktion zum Speichern der eingegebenen Zahl im Local Storage
    function saveToLocalStorage(educationKey, value) {
        if (value !== '') {
            localStorage.setItem(educationKey, value);
        }
        loadFromLocalStorage();
    }

    // Funktion zum Laden und Anzeigen der im Local Storage gespeicherten Zahlen
    function loadFromLocalStorage() {
        const inputFields = document.querySelectorAll('.educationInput');

        for (let i = 0, n = inputFields.length; i < n; i++) {
            const radioButton = inputFields[i].closest('.radio');
            let educationKey;

            if (radioButton) {
                educationKey =  inputFields[i].closest('.radio').querySelector('input[type="radio"]').getAttribute('education_key');
            } else if (globalEducationKey) {
                educationKey = globalEducationKey;
            } else {
                return;
            }

            const storedValue = localStorage.getItem(educationKey);
            if (storedValue) {
                inputFields[i].value = storedValue;
            }
        }
    }

    // Funktion zum Löschen der im Local Storage gespeicherten Zahlen
    function deleteFromLocalStorage(educationKey) {
        localStorage.removeItem(educationKey);
        loadFromLocalStorage();
    }

    // Funktion zum Setzen des StoredValue für einen bestimmten educationKey
    function setStoredValueForEducationKey(educationKey) {
        const inputField = document.querySelector('.educationInput[education_key="' + educationKey + '"]');
        const storedValue = localStorage.getItem(educationKey);
        if (inputField && storedValue) {
            inputField.value = storedValue;
        }
    }

    // CSS-Stile für die Anordnung der Eingabefelder und Buttons
    const styles = `
            label[for^="education_"],
            .education-filter-container {
                display: inline-block;
            }
            
            label[for^="education_"] {
                min-width: 450px;
            }
            
            .education-filter-container button:first-of-type {
                margin-right: 5px;
                margin-left: 25px;
            }
            
            .education-filter-container.education {
                margin-bottom: 25px;
            }
        `;

    // CSS-Stile einfügen
    const styleElement = document.createElement('style');
    styleElement.innerHTML = styles;
    document.head.appendChild(styleElement);
})();
