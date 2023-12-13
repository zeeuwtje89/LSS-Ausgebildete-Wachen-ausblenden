// ==UserScript==
// @name         LSS Ausgebildete Wachen ausblenden
// @namespace    www.leitstellenspiel.de
// @version      0.8
// @description  Blende Wachen in der Schule aus, die mehr ausgebildetes Personal haben, als angegeben
// @author       MissSobol
// @match        https://www.leitstellenspiel.de/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Überprüfen, ob das div-Element mit der ID "schooling" existiert
    var schoolingDiv = document.getElementById('schooling');
    if (schoolingDiv) {
        // Einfügen eines Eingabefelds, Speichern-Buttons und Löschen-Buttons neben jedem Radio-Element
        var radioElements = document.querySelectorAll('.radio input[type="radio"]');
        radioElements.forEach(function (radio) {
            var inputField = document.createElement('input');
            inputField.type = 'number';
            inputField.className = 'educationInput';
            inputField.placeholder = 'Min Personal';

            // Direktes Lesen des education_key-Attributs vom Radiobutton
            var educationKey = radio.getAttribute('education_key');

            if (educationKey) {
                radio.parentNode.appendChild(inputField);

                // Einfügen der Speichern-Button für jedes Radio-Element
                var saveButton = document.createElement('button');
                saveButton.textContent = 'Speichern';
                saveButton.id = 'saveButton_' + educationKey;
                saveButton.className = 'btn btn-xs btn-success';
                saveButton.addEventListener('click', function (event) {
                    event.preventDefault(); // Verhindert das Standardverhalten des Buttons
                    saveToLocalStorage(educationKey, inputField.value.trim());
                });
                radio.parentNode.appendChild(saveButton);

                // Einfügen der Löschen-Button für jedes Radio-Element
                var deleteButton = document.createElement('button');
                deleteButton.textContent = 'Löschen';
                deleteButton.id = 'deleteButton_' + educationKey;
                deleteButton.className = 'btn btn-xs btn-danger';
                deleteButton.addEventListener('click', function (event) {
                    event.preventDefault(); // Verhindert das Standardverhalten des Buttons
                    deleteFromLocalStorage(educationKey);
                });
                radio.parentNode.appendChild(deleteButton);

                // Eventlistener hinzufügen, um den StoredValue beim Ändern des Radiobuttons zu aktualisieren
                radio.addEventListener('change', function () {
                    // Setzen des StoredValue für den aktiven Radiobutton beim Ändern
                    setStoredValueForEducationKey(educationKey);
                    console.log('Aktives Radio: ' + educationKey);
                });

                // Überprüfen, ob der Radiobutton ausgewählt ist und den zugehörigen StoredValue setzen
                if (radio.checked) {
                    setStoredValueForEducationKey(educationKey);
                }
            }
        });

        // Laden und Anzeigen der im Local Storage gespeicherten Zahlen
        loadFromLocalStorage();

        // Überprüfen der Panels in einem Intervall von 1 Sekunde
        setInterval(checkPanels, 500);

        // Funktion zum Überprüfen der Panels
        function checkPanels() {
            // Überprüfen, ob das Element mit der ID "accordion" existiert
            var accordionDiv = document.getElementById('accordion');
            if (accordionDiv) {
                // Überprüfen aller Panel-Elemente
                var panelElements = accordionDiv.getElementsByClassName('panel panel-default');
                for (var i = 0; i < panelElements.length; i++) {
                    var panel = panelElements[i];
                    var labelText = panel.textContent.match(/(\d+) ausgebildete Personen/);
                    if (labelText) {
                        var numTrained = parseInt(labelText[1]);

                        // Ausblenden des Panels, wenn die Bedingung erfüllt ist
                        if (isPanelHidden(panel, numTrained)) {
                            panel.style.display = 'none';
                            console.log('Panel ausgeblendet:', panel);
                        } else {
                            console.log('Panel nicht ausgeblendet:', panel);
                        }
                    }
                }
            }
        }

        // Funktion zum Überprüfen, ob ein Panel ausgeblendet werden soll
        function isPanelHidden(panel, numTrained) {
            // Ausgewähltes Radio-Element finden
            var selectedRadio = document.querySelector('.radio input[type="radio"]:checked');
            if (selectedRadio) {
                var educationKey = selectedRadio.getAttribute('education_key');
                var storedValue = localStorage.getItem(educationKey);

                // Panel ausblenden, wenn NumTrained größer ist als gespeicherter Wert
                var isHidden = storedValue && numTrained > parseInt(storedValue);
                console.log('Panel: ', panel, 'NumTrained:', numTrained, 'StoredValue:', storedValue, 'IsHidden:', isHidden);
                return isHidden;
            }

            return false;
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
            var inputFields = document.querySelectorAll('.educationInput');
            inputFields.forEach(function (input, index) {
                var educationKey = input.closest('.radio').querySelector('input[type="radio"]').getAttribute('education_key');
                var storedValue = localStorage.getItem(educationKey);
                if (storedValue) {
                    input.value = storedValue;
                }
            });
        }

        // Funktion zum Löschen der im Local Storage gespeicherten Zahlen
        function deleteFromLocalStorage(educationKey) {
            localStorage.removeItem(educationKey);
            loadFromLocalStorage();
        }

        // Funktion zum Setzen des StoredValue für einen bestimmten educationKey
        function setStoredValueForEducationKey(educationKey) {
            var inputField = document.querySelector('.educationInput[education_key="' + educationKey + '"]');
            var storedValue = localStorage.getItem(educationKey);
            if (inputField && storedValue) {
                inputField.value = storedValue;
            }
        }

        // CSS-Stile für die Anordnung der Eingabefelder und Buttons
        var styles = `
            .radio {
                position: relative;
                margin-bottom: 10px;
            }

            .label-container {
                position: absolute;
                left: 0;
                top: 50%;
                transform: translateY(-50%);
                min-width: 200px;
            }

            .educationInput {
                position: absolute;
                left: 20%;
                top: 50%;
                transform: translate(-50%, -50%);
                margin-right: 5px;
                width: 100px;
            }

            .educationInput,
            button {
                display: inline-block;
            }

            button {
                position: absolute;
                top: 50%;
                width: auto;
            }

            .btn.btn-xs.btn-success {
                left: calc(20% + 110px);
                transform: translateY(-50%);
            }

            .btn.btn-xs.btn-danger {
                left: calc(20% + 210px);
                transform: translateY(-50%);
            }
        `;

        // CSS-Stile einfügen
        var styleElement = document.createElement('style');
        styleElement.innerHTML = styles;
        document.head.appendChild(styleElement);
    }
})();
