$(document).ready(function () {
    let colorSchemes = [];
    
    /* ------------------- Overall setup ------------------- */
    // get & process color scheme data
    function fetchColorSchemes() {
        fetch('assets/schemes.txt')
            .then(response => {
                if (!response.ok) throw new Error("Network response was not ok");
                return response.text();
            })
            .then(data => {
                colorSchemes = processColorSchemeData(data);
                populateColorCountDropdown();
                populateSchemeDropdown(colorSchemes);
                initializeSelect2();
            })
            .catch(error => {
                console.error("Failed to fetch color schemes:", error);
            });
    }

    function processColorSchemeData(data) {
        const lines = data.trim().split('\n');
        return lines.map(line => line.split(',').map(color => color.trim().toUpperCase()))
            .sort((a, b) => a.length - b.length)
            .map((schemeColors, index) => ({ id: index, colors: schemeColors }));
    }

    // Setup event listeners
    function bindEventListeners() {
        $('#predefinedSchemeOption').on('change', handlePredefinedSchemeSwitch);
        $('#customSchemeOption').on('change', handleCustomSchemeSwitch);
        $('#colorCountSelect').on('change', handleColorCountChange);
        $('#schemeSelect').on('change', handleSchemeChange);
        $('#customColors').on('input', handleCustomColorInput);
    }

    /* ------------------- Event handlers ------------------- */
    // Mode switch handlers (Predefined vs Custom)
    function handlePredefinedSchemeSwitch() {
        $('#predefinedContent').show();
        $('#customInputContent').hide();
        const selectedSchemeID = parseInt($('#schemeSelect').val());
        if (!isNaN(selectedSchemeID)) {
            applySchemeByIndex(selectedSchemeID);
        }
    }
    function handleCustomSchemeSwitch() {
        $('#predefinedContent').hide();
        $('#customInputContent').show();
        $('#hexDisplay').html('<strong>Current scheme: </strong>');
        $('#colorSwatches').empty();
    }

    // Custom color input handler
    function handleCustomColorInput() {
        // read input, validate, and update display
        const customColors = $(this).val().split(',')
            .map(color => color.trim().toUpperCase())
            .filter(isValidHex);
        if (customColors.length > 0) {
            updateSchemeDisplay(customColors);
        } else {
            $('#hexDisplay').html('<strong>Invalid HEX code(s) detected. Please enter valid HEX values.</strong>');
            $('#colorSwatches').empty();
        }
    }

    function isValidHex(color) {
        const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        return hexRegex.test(color);
    }

    // Initialize Select2 dropdowns (color count and scheme)
    function initializeSelect2() {
        $('#colorCountSelect').select2({ minimumResultsForSearch: Infinity });
        $('#schemeSelect').select2({ 
            templateResult: formatOption,
            templateSelection: formatOptionSelection,
            minimumResultsForSearch: Infinity 
        });
    }

    // Custom rendering for options in the dropdown
    function formatOption(scheme) {
        if (!scheme.id) return scheme.text;
        const selectedScheme = colorSchemes.find(s => s.id == scheme.id);
        const swatches = selectedScheme.colors.map(color => `<span class="color-swatch" style="background-color: ${color};"></span>`).join('');
        return $('<span>' + swatches + scheme.text + '</span>');
    }

    // Custom rendering for the selected option
    function formatOptionSelection(scheme) {
        if (!scheme.id) return scheme.text;
        const selectedScheme = colorSchemes.find(s => s.id == scheme.id);
        const swatches = selectedScheme.colors.map(color => `<span class="color-swatch" style="background-color: ${color};"></span>`).join('');
        return $('<span>' + swatches + scheme.text + '</span>');
    }

    // Populate color count dropdown
    function populateColorCountDropdown() {
        const colorCounts = [...new Set(colorSchemes.map(scheme => scheme.colors.length))].sort((a, b) => a - b);
        const $colorCountSelect = $('#colorCountSelect').empty();
        $colorCountSelect.append(`<option value="-1">All Schemes</option>`);
        colorCounts.forEach(count => {
            $colorCountSelect.append(`<option value="${count}">${count}-color schemes</option>`);
        });
    }

    // Handle color count change
    function handleColorCountChange() {
        const selectedCount = parseInt($(this).val());
        const filteredSchemes = selectedCount === -1 ? colorSchemes : colorSchemes.filter(scheme => scheme.colors.length === selectedCount);
        populateSchemeDropdown(filteredSchemes);
    }

    // Populate scheme dropdown with color swatches
    function populateSchemeDropdown(schemes) {
        const $schemeSelect = $('#schemeSelect').empty();
        schemes.forEach(scheme => {
            $schemeSelect.append(new Option(`S${scheme.id + 1}`, scheme.id));
        });
        if (schemes.length > 0) {
            $schemeSelect.val(schemes[0].id).trigger('change');
        }
    }

    function applySchemeByIndex(schemeID) {
        const selectedScheme = colorSchemes.find(scheme => scheme.id === schemeID);
        updateSchemeDisplay(selectedScheme.colors);
    }

    function handleSchemeChange() {
        const selectedSchemeID = parseInt($(this).val());
        applySchemeByIndex(selectedSchemeID);
    }

    // Update all scheme display
    function renderHexDisplay(colors) {
        const hexText = colors.map(color => `<span style="color: ${color};">${color}</span>`).join(', ');
        $('#hexDisplay').html(`<strong>Current scheme:</strong> ${hexText}`);
    }

    function renderSwatches(colors) {
        const $swatchesContainer = $('#colorSwatches').empty();
        colors.forEach(color => {
            const $swatch = $(`<div class="swatch" style="background-color: ${color};"></div>`);
            $swatch.on('click', () => {
                copyToClipboard(color);
                showCopyNotification(color);
            });
            $swatchesContainer.append($swatch);
        });
    }

    function updateSchemeDisplay(colors) {
        renderHexDisplay(colors);
        renderSwatches(colors);
        renderCharts(colors);
    }

    // Copy color HEX to clipboard
    function copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                console.log(`Copied to clipboard: ${text}`);
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        } else {
            const tempInput = document.createElement('input');
            document.body.appendChild(tempInput);
            tempInput.value = text;
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);
        }
    }

    function showCopyNotification(color) {
        const $notification = $('<div class="copy-notification">').text(`Copied ${color} to clipboard!`);
        $('.color-swatches').after($notification);
        setTimeout(() => {
            $notification.fadeOut(500, () => $notification.remove());
        }, 700);
    }

    // Initialize the app
    fetchColorSchemes();
    bindEventListeners();
    $('#customInputContent').hide(); // Initial hide
});
