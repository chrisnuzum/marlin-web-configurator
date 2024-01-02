/* TODO:

Make comments be added to hideableContainers
Disable/make readonly/gray out controls that aren't enabled or are in a hideableContainer that isn't active
Add all of the "other" and "multiple" controls
Deal with special if statements on lines 160, 164, and 169 (they display now but might cause errors when checking for conditions)

*/

/*
Notes:
Lines 1708 & 2604: problem fixed with regex but maybe a typo in the original document, uses :{ } instead of :[ ]
Line 3455: should definitely have spaces after commas
*/

var matches = []; // probably doesn't need to be global

class Line {
    // this object should just hold the line info, and should break down any piece that needs further broken down
    constructor(regex_match) {
        this.rawLine = regex_match[0];
        this.beginWhitespace = regex_match.groups.whitespace;
        this.isBlockComment = regex_match.groups.is_block_comment;
        this.isLineComment = regex_match.groups.is_line_comment;
        this.equalsHeader = regex_match.groups.equals_header;
        this.atHeader = regex_match.groups.at_header;

        this.hasHashtag = regex_match.groups.has_hashtag;
        this.pragmaLine = regex_match.groups.pragma_line;

        this.ifStatement = regex_match.groups.if_statement; // ifndef|ifdef|if|elif
        /*
        If statement types:
        ifdef VAR_NAME
        if ANY(VAR_1, VAR_2)                enabled
        if VAR_NAME > #   if VAR_NAME(#)    condition
        
        if VAR_NAME
        */
        this.enabledType = regex_match.groups.enabled_type; // ENABLED|DISABLED|ANY|ALL|BOTH|EITHER (last 2 not used anymore)
        if (regex_match.groups.enabled_type_vars !== undefined) {
            this.enabledTypeVars =
                regex_match.groups.enabled_type_vars.split(", ");
        } else {
            this.enabledTypeVars = undefined;
        }

        this.conditionVariable = regex_match.groups.condition_variable; // line 594 has condition_variable with no operator or value
        this.operator = regex_match.groups.operator; // <,>,=,(  inside parentheses is basically just = (= no longer used)
        this.conditionValue = regex_match.groups.condition_value;

        this.isDefine = regex_match.groups.is_define;
        this.variable = regex_match.groups.variable;
        this.spaceFromVarToNext = regex_match.groups.space_from_var_to_next;
        this.hasBracket = regex_match.groups.has_bracket;
        this.hasParentheses = regex_match.groups.has_paren;
        this.hasQuote = regex_match.groups.has_quote;
        this.value = regex_match.groups.value; // regex this to determine what type of variable it is

        this.endif = regex_match.groups.endif;
        this.spaceToComment = regex_match.groups.space_to_comment;
        this.hasLineEndComment = regex_match.groups.has_line_end_comment;

        if (regex_match.groups.special_comment_line !== undefined) {
            if (regex_match.groups.special_comment_line.includes(", ")) {
                this.dropdownOptions =
                    regex_match.groups.special_comment_line.split(", ");
            } else {    // for line 3455 which doesn't put spaces after commas
                this.dropdownOptions =
                    regex_match.groups.special_comment_line.split(",");
            }
        } else {
            this.dropdownOptions = undefined;
        }
        this.commentText = regex_match.groups.comment_text;
    }
}

class Label {
    // check for links in block and line comments: https://stackoverflow.com/questions/49634850/convert-plain-text-links-to-clickable-links?answertab=trending#tab-top
    constructor(type = "line", text = "") {
        this.baseElement = document.createElement("label");
        this.text = text;
        if (type == "block") {
            this.text = "";
            this.baseElement.setAttribute("class", "block_comment");
        } else if (type == "at_header") {
            this.baseElement.setAttribute("class", "at_header");
            this.finalize();
        } else if (type == "equals_header") {
            this.baseElement.setAttribute("class", "equals_header");
            this.finalize();
        } else if (type == "line") {
            this.baseElement.setAttribute("class", "line_comment");
            this.finalize();
        } else {
            console.error("Bad label type: " + type);
        }
    }
    addLine(new_line) {
        this.text += new_line + "\r\n";
    }
    finalize() {
        this.baseElement.textContent = this.text;
    }
}

class HideableContainer {
    /* will need to also store a reference to each widget so it can check each one's value
     *      whenever checkCondition is called
     * to change details open (or checkbox checked or disabled) attribute, must use
     *      .setAttribute("open", "") to open and .removeAttribute("open") to close
     * 
     * TODO: lines 160, 164, 169 need addressed for condition checking
     * #if TEMP_SENSOR_IS_MAX_TC(1)
     * #if HAS_E_TEMP_SENSOR
     */
    constructor() {
        this.baseElement = document.createElement("details");
        this.conditionWidgets = [];
    }
    addElement(element) {
        this.baseElement.append(element);
    }
    setCondition({
        type,
        enabledType,
        enabledTypeVars,
        conditionVariable,
        operator = "",
        conditionValue = ""
    } = {}) {
        if (type == "enabledType") {
            this.enabledType = enabledType;
            this.enabledTypeVars = enabledTypeVars;
            let title = document.createElement("summary");
            title.textContent = enabledType + "(" + enabledTypeVars + ")";
            this.baseElement.append(title);
        } else if (type == "condition") {
            if (operator !== "") {
                this.operator = operator;
            } else {
                this.operator = "NO OPERATOR";
            }
            if (conditionValue !== "") {
                this.conditionValue = conditionValue;
            }
            let title = document.createElement("summary");
            title.textContent = conditionVariable + operator + conditionValue;
            if (operator == "(") {
                title.textContent += ")";
            }
            this.baseElement.append(title);
        }
        this.type = type;
    }
    addConditionWidget(widget) {
        this.conditionWidgets.push(widget);
    }
    checkCondition() {
        if (this.conditionWidgets.length > 0) {
            if (this.type == "enabledType") {
                for (const widget of this.conditionWidgets) {
                    if (["ENABLED", "ANY"].includes(this.enabledType)) {
                        this.baseElement.removeAttribute("open", "");
                        if (widget.isEnabled()) {
                            this.baseElement.setAttribute("open", "");
                            break;
                        }
                    } else if (this.enabledType == "ALL") {
                        this.baseElement.setAttribute("open", "");
                        if (!widget.isEnabled()) {
                            this.baseElement.removeAttribute("open", "");
                            break;
                        }
                    } else if (this.enabledType == "DISABLED") {
                        this.baseElement.setAttribute("open", "");
                        if (widget.isEnabled()) {
                            this.baseElement.removeAttribute("open", "");
                            break;
                        }
                    } else {
                        console.error(
                            "Unknown enabledType for hideable container: " +
                            this.enabledType
                        );
                    }
                }
            } else if (this.type == "condition") {
                if (this.conditionWidgets.length > 1) {
                    console.error("More than one condition widget for operator/condition type widget!");
                }
                const widget = this.conditionWidgets[0];    // there can only be 1
                if (this.operator == "NO OPERATOR") {
                    this.baseElement.removeAttribute("open", "");
                    if (widget.isEnabled()) {
                        this.baseElement.setAttribute("open", "");
                    }
                } else if (this.operator == "(") {
                    this.baseElement.removeAttribute("open", "");
                    if (widget.getValue() == Number(this.conditionValue)) {
                        this.baseElement.setAttribute("open", "");
                    }
                } else if (this.operator == "<") {
                    this.baseElement.removeAttribute("open", "");
                    if (widget.getValue() < Number(this.conditionValue)) {
                        this.baseElement.setAttribute("open", "");
                    }
                } else if (this.operator == ">") {
                    this.baseElement.removeAttribute("open", "");
                    if (widget.getValue() > Number(this.conditionValue)) {
                        this.baseElement.setAttribute("open", "");
                    }
                } else {
                    console.error(
                        "Unknown operator type for hideable container: " +
                        this.operator
                    );
                }
            } else {
                console.error(
                    "Unknown condition type for hideable container: " + this.type
                );
            }
        } else {
            console.log("No condition widgets for this condition.");
        }
    }
}

class Widget {
    /* Holds all relevant regex info, a list of dependent HideableContainers, a base <div> htmlElement
     *      that holds all necessary elements (checkbox, label, textbox, etc.)
     * A Widget has a checkbox if either type="checkbox" or isDisabled=true
     *      isDisabled means the line has a value but was originally commented out
     * Should set up a tooltip on hover with relevant CSS classes if there is a line end comment
     * Should set up event listeners that change this.changed to true (could check if value matches
     *      original value) and maybe updates this.value?
     *      Event listener should also call HideableContainer.checkCondition() on each of this.containers
     *      Events: "input" is fired whenever value is changed at all.
     *              "change" is fired when input is changed for checkbox and dropdown but only when losing focus for text
     * To change details open (or checkbox checked or disabled) attribute, must use
     *      .setAttribute("open", "") to open and .removeAttribute("open") to close
     */
    constructor({
        type = "other",
        isDisabled = false,
        dropdownOptions = [],
        variableName,
        value
    } = {}) {
        // call with Widget({type: "dropdown", isDisabled: false})
        this.type = type;
        this.baseElement = document.createElement("div");
        this.baseElement.setAttribute("class", "widgetBase");
        this.widgetElement = null;
        this.isDisabled = isDisabled;
        this.containers = [];
        this.initialValue = null;
        this.changed = false;
        if (isDisabled == true || type == "checkbox") {
            let checkbox = document.createElement("input");
            checkbox.setAttribute("type", "checkbox");
            if (isDisabled == false) {
                console.log("Checkbox disabled = false: " + variableName);
                checkbox.setAttribute("checked", "");
                this.initialValue = true;
            }
            this.baseElement.append(checkbox);
            if (type == "checkbox") {
                this.widgetElement = checkbox;
            }
        }
        let label = document.createElement("label");
        label.textContent = variableName;
        this.baseElement.append(label);
        if (type == "dropdown") {
            // if contains a colon then it is in value:'display_text' format
            let dropdownElement = document.createElement("select");
            let foundValue = false;
            for (const option of dropdownOptions) {
                let o = document.createElement("option");
                let optionValue = option;
                let optionText = option;
                if (optionText.includes(":")) {
                    optionValue = optionValue.slice(0, optionValue.indexOf(":"));
                    optionText = optionText.slice(optionText.indexOf(":") + 1);
                }
                if (optionValue.charAt(0) == "'") {
                    optionValue = optionValue.slice(1, -1);
                }
                if (optionText.charAt(0) == "'") {
                    optionText = optionText.slice(1, -1);
                }
                o.textContent = optionText;
                o.setAttribute("value", optionValue);

                if (!foundValue && optionValue == value) {
                    foundValue = true;
                    this.initialValue = value;
                    o.setAttribute("selected", "");
                }
                dropdownElement.append(o);
            }
            if (!foundValue) {
                console.error("Selected dropdown option not in list!");
            }
            this.baseElement.append(dropdownElement);
            this.widgetElement = dropdownElement;
        } else if (type == "textbox") {    // TODO: if over a certain length, probably use <textarea> instead
            let textbox = document.createElement("input");
            textbox.setAttribute("type", "text");
            textbox.setAttribute("value", value);
            this.baseElement.append(textbox);
            this.initialValue = value;
            this.widgetElement = textbox;
        } else if (type == "multiple") {
            /*
            Possible values:
            { 0, 90 }
            { 80, 80, 400, 93 }
            (133*60)
            { PROBE_DEPLOY_FEEDRATE, { 245, 114, 30 } }
            { (X_BED_SIZE) * 3 / 4 - (CLIP_W) / 2, (Y_BED_SIZE) - (CLIP_H), (X_BED_SIZE) * 3 / 4 + (CLIP_W) / 2, Y_BED_SIZE }
            ((CLIP_H) + 1)
            { (50*60), (50*60), (4*60) }
            { 698, 300, 0, 50, 523, 50, 0, 25, 494, 50, 0, 25, 523, 100, 0, 50, 554, 300, 0, 100, 523, 300 }
            */
        } else if (type == "other") {
            /*
            Possible values:
            02010300
            Version.h
            BOARD_BTT_SKR_MINI_E3_V3_0
            128
            1.75
            -50
            282.8427124746
            */
        }
        if (this.initialValue === null) {
            console.error("widget initial value has not been set!");
        }
        if (this.widgetElement === null) {
            console.error("widgetElement has not been set!");
        } else {
            this.widgetElement.addEventListener("change", () => {
                // "this" inside this function refers to the actual HTML element,
                // NOT the Widget object                
                if (this.widgetElement !== undefined)
                {
                    if (this.widgetElement.value !== this.initialValue) {
                        this.changed = true;
                    } else {
                        this.changed = false;
                    }
                } else {
                    console.error("widgetElement is undefined!");
                }
                console.log(this.getValue());
            });
        }
    }
    addTooltip(tooltipText) {
        // TODO: probably change this to a custom attribute to be able to use custom styling
        this.baseElement.setAttribute("title", tooltipText);
    }
    addContainer(container) {
        this.containers.push(container); //on widget value change, call container.check()
    }
    isEnabled() {
        return !this.isDisabled;
    }
    getValue() {
        // handle type conversion like Number()?
        if (this.type == "dropdown" || this.type == "textbox") {
            return this.widgetElement.value;
        } else if (this.type == "checkbox") {
            return this.widgetElement.checked;
        }
    }
}

function loadFile() {
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        var preview = document.getElementById("test");
        var file = document.querySelector("input[type=file]").files[0];
        var reader = new FileReader();
        reader.onload = function (event) {
            var full_text = this.result; //event.target.result
            var re =
                /^(?<whitespace>[ \t]*)(?:(?<is_block_comment>\/\*\*|\*\/|\*)|(?:(?<is_line_comment>\/\/)?(?:=*(?<equals_header>(?<=[=])[\w >\/\-()]*(?=[=]))=*)?(?:[ ]?@section[ ](?<at_header>(?<=@section )[\w ]*))?)(?:(?<end_of_line>$)|(?<has_hashtag>#)?(?<pragma_line>pragma \w*)?(?:(?<if_statement>ifndef|ifdef|if|elif)[ ](?:(?<enabled_type>ENABLED|DISABLED|EITHER|ANY|BOTH|ALL)[(](?<enabled_type_vars>(?<=[(]).*(?=[)]))[)]|(?<condition_variable>\w*)[ ]?(?<operator>[<>(]*)?[ ]?(?<condition_value>\w*)?[)]?))?(?:(?<is_define>define)[ ]?(?<variable>\w*)(?<space_from_var_to_next>[ ]*)(?<has_bracket>[{])?(?<has_paren>[(])?(?<has_quote>[\"\'])?[ ]?(?<value>(?:(?<=[{][ ]?)(?:(?!\/\/).)*(?=\})|(?:(?<=[(])(?:(?!\/\/).)*(?=\))|(?:(?<=[\"\']).*?(?:(?=\")|(?=\'))|[-.\w]*))))[})\"\']?)?(?<endif>endif)?(?<space_to_comment>[ ]*)(?<has_line_end_comment>\/\/)?))[ ]?(?::[\[{][ ]?(?<special_comment_line>.*[^ ])[ ]?[\]}])?(?<comment_text>.*)?/;
            // https://regex101.com/r/3GU3om
            // [(]@.*?\n[ ]*[)][?]   < use in Notepad++ replace all
            var lines = full_text.split(/\r\n|\n/);
            lines.forEach((line) => {
                var matchedLine = line.match(re);
                var lineObject = new Line(matchedLine);
                matches.push(lineObject);
            });
            //make_widgets(matches);
            let widgetObjects = make_widgets2(matches);
            for (const widgetObject of widgetObjects) {
                document
                    .getElementById("container")
                    .appendChild(widgetObject.baseElement);
                document
                    .getElementById("container")
                    .appendChild(document.createElement("br"));
                // TODO: get rid of <br> and just add margin/padding around widgets
            }
        };
        reader.readAsText(file);
    } else {
        alert("Your browser is too old to support the HTML5 File API.");
    }
}

function make_widgets2(lines) {
    /*  block_comment?
     *      Yes:
     *          /**: var label = new Label("block")
     *          *: special_comment_line?
     *                Yes > save for variable after end of block comment
     *                No > label.addLine(item.label_text/comment_text)
     *          * /: label.finalize()
     *      No:
     *          line_comment & !is_define?
     *              Yes:
     *                  at_header?          previous at_header could be added to each widget to know what section they are under
     *                      > var label = new Label("at_header", text)
     *                  equals_header?      only one of each equals header exists, basically subheader for at_header
     *                      > var label = new Label("equals_header", text)
     *                  neither > var label = new Label("line", text)       line_comment describes the next line's variable
     *          pragma line? > var label = new Label("line", item.raw_line)
     *          if_statement? > var hideable = new HideableContainer()
     *          is_define?
     *              Yes:
     *                  line_comment? >
     */
    var htmlElements = [];
    var hideableContainers = [];
    var variableWidgetPairs = {}; // store string of define variable and corresponding widget that can be searched when if statements are encountered later
    // in order to add the hideable container to the corresponding variable widget so {"SINGLE_NOZZLE": checkboxobject}
    let blockLabel = null;
    let blockCommentDropdownOptions = null;
    let lastBlockCommentDropdownOptions = null;
    let lastVariableName = null;
    let count = 0;
    for (const [index, line] of lines.entries()) {
        if (line.isBlockComment) {
            if (line.isBlockComment == "/**") {
                blockLabel = new Label("block");
            } else if (line.isBlockComment == "*") {
                if (line.dropdownOptions) {
                    console.log(
                        "Line " + index + " - Found dropdown options in block comment."
                    );
                    blockCommentDropdownOptions = line.dropdownOptions;
                } else {
                    if (blockLabel === null) {
                        console.error("Block comment label does not exist.");
                    } else {
                        if (line.commentText) {
                            blockLabel.addLine(line.commentText);
                        }
                    }
                }
            } else if (line.isBlockComment == "*/") {
                if (blockLabel === null) {
                    console.error("Block comment label does not exist.");
                } else {
                    blockLabel.finalize();
                    htmlElements.push(blockLabel);
                    blockLabel = null;
                }
            }
        } else if (line.isLineComment && !line.isDefine) {
            if (line.dropdownOptions) {
                console.log(
                    "Line " + index + " - Found dropdown options in line comment."
                );
                blockCommentDropdownOptions = line.dropdownOptions;
            } else {
                let lineLabel = null;
                if (line.atHeader) {
                    lineLabel = new Label("at_header", line.atHeader);
                } else if (line.equalsHeader) {
                    lineLabel = new Label("equals_header", line.equalsHeader);
                } else {
                    lineLabel = new Label("line", line.commentText);
                }
                htmlElements.push(lineLabel);
            }
        } else if (line.pragmaLine) {
            let pragma_label = new Label("line", line.rawLine);
            htmlElements.push(pragma_label);
        } else if (line.ifStatement) {
            let newContainer = new HideableContainer();
            count++;
            if (line.enabledType || line.ifStatement == "ifdef" || line.ifStatement == "ifndef") {
                let lineEnabledType = null;
                let lineEnabledTypeVars = null;
                if (line.ifStatement == "ifdef") {
                    lineEnabledType = "ENABLED";
                    lineEnabledTypeVars = [line.conditionVariable];
                } else if (line.ifStatement == "ifndef") {
                    lineEnabledType = "DISABLED";
                    lineEnabledTypeVars = [line.conditionVariable];
                } else {
                    lineEnabledType = line.enabledType;
                    lineEnabledTypeVars = line.enabledTypeVars;
                }
                console.log("If statement enabled type: " + lineEnabledType + ", variable: " + lineEnabledTypeVars);
                newContainer.setCondition({
                    type: "enabledType",
                    enabledType: lineEnabledType,
                    enabledTypeVars: lineEnabledTypeVars
                });
                if (lineEnabledTypeVars !== undefined) {
                    for (const typeVariable of lineEnabledTypeVars) {
                        let foundWidget = variableWidgetPairs[typeVariable];
                        if (foundWidget === undefined) {
                            // TODO: this is not necessarily unwanted behavior, line 74 MOTHERBOARD is not defined beforehand
                            console.error(
                                "If statement variable (enabled type) has not been defined yet!: " +
                                typeVariable
                            );
                        } else {
                            console.log(
                                count +
                                " - Successfully found if statement variable (enabled type): " +
                                typeVariable
                            );
                            foundWidget.addContainer(newContainer);
                            newContainer.addConditionWidget(foundWidget);
                        }
                    }
                } else {
                    console.error("Line " + index + " - No enabledTypeVars for this line!");
                }

            } else {
                let foundWidget = variableWidgetPairs[line.conditionVariable];
                if (foundWidget === undefined) {
                    console.error(
                        "If statement variable (condition type) has not been defined yet!: " +
                        line.conditionVariable
                    );
                } else {
                    console.log(
                        count +
                        " - Successfully found if statement variable (condition type): " +
                        line.conditionVariable
                    );
                    foundWidget.addContainer(newContainer);
                    newContainer.addConditionWidget(foundWidget);
                }
                if (line.operator) {
                    newContainer.setCondition({
                        type: "condition",
                        conditionVariable: line.conditionVariable,
                        operator: line.operator,
                        conditionValue: line.conditionValue
                    });
                } else {
                    newContainer.setCondition({
                        type: "condition",
                        conditionVariable: line.conditionVariable
                    });
                }
            }
            newContainer.checkCondition();    //TODO: enable this and fix error
            if (line.ifStatement == "elif") {
                if (hideableContainers.pop() === undefined) {
                    console.error("Line " + index + " - hideableContainers already empty!");
                }
            }
            hideableContainers.push(newContainer);
            if (hideableContainers.length > 1) {
                console.log("Line " + index + " - adding hideableContainer to parent container");
                hideableContainers[hideableContainers.length - 2].addElement(hideableContainers[hideableContainers.length - 1].baseElement);
            } else {
                htmlElements.push(hideableContainers[hideableContainers.length - 1]);
            }

            // to get last: hideableContainers[hideableContainers.length - 1]
        } else if (line.endif) {
            if (hideableContainers.pop() === undefined) {
                console.error("Line " + index + " - More endifs than ifs!");
            }
        } else if (line.isDefine) {
            count++;
            var widget = null;
            var isDisabled = false;
            if (line.isLineComment) {
                isDisabled = true;
            }
            if (lastBlockCommentDropdownOptions !== null) { // if everything after first underscore is the same as last variable, use same dropdown options
                if (lastVariableName.indexOf("_") > -1 && line.variable.endsWith(lastVariableName.slice(lastVariableName.indexOf("_")))) {
                    blockCommentDropdownOptions = lastBlockCommentDropdownOptions;
                } else {
                    lastBlockCommentDropdownOptions = null;
                }
            }
            if (line.dropdownOptions || blockCommentDropdownOptions !== null) {
                console.log(
                    count + " - Applying dropdown options to " + line.variable
                );
                let dropdownOptions = [];
                if (blockCommentDropdownOptions !== null) {
                    dropdownOptions = blockCommentDropdownOptions;
                    lastBlockCommentDropdownOptions = blockCommentDropdownOptions;
                    lastVariableName = line.variable;
                    blockCommentDropdownOptions = null;
                } else {
                    dropdownOptions = line.dropdownOptions;
                }

                widget = new Widget({
                    type: "dropdown",
                    isDisabled: isDisabled,
                    dropdownOptions: dropdownOptions,
                    variableName: line.variable,
                    value: line.value
                });
            } else if (!line.value || line.value == "") {
                console.log(count + " - checkbox: " + line.variable);
                widget = new Widget({
                    type: "checkbox",
                    isDisabled: isDisabled,
                    variableName: line.variable
                });
            } else if (line.hasBracket || line.hasParentheses) {
                console.log(count + " - multiple: " + line.variable);
                widget = new Widget({
                    type: "multiple",
                    isDisabled: isDisabled,
                    variableName: line.variable,
                    value: line.value
                });
            } else if (line.hasQuote) {
                console.log(count + " - textbox: " + line.variable);
                widget = new Widget({
                    type: "textbox",
                    isDisabled: isDisabled,
                    variableName: line.variable,
                    value: line.value
                });
            } else {
                console.log(count + " - other: " + line.variable);
                widget = new Widget({
                    type: "other",
                    isDisabled: isDisabled,
                    variableName: line.variable,
                    value: line.value
                });
            }
            if (line.hasLineEndComment) {
                widget.addTooltip(line.commentText);
            }
            if (hideableContainers.length > 0) {
                hideableContainers[hideableContainers.length - 1].addElement(widget.baseElement);
            } else {
                htmlElements.push(widget);
            }
            variableWidgetPairs[line.variable] = widget;
        }
    }
    return htmlElements;
}

function make_widgets(items) {
    console.log("making widgets");
    const widgets = [];
    var count = 0;
    for (const [index, item] of items.entries()) {
        let widget = null;
        if (item.type == "label") {
            const standalone = item.isBlockComment !== null;
            const header = item.atHeader !== null || item.equalsHeader !== null;
            widget = document.createElement("label");
            widget.textContent = item.labelText;
            document.getElementById("container").appendChild(widget);
        } else if (item.type == "checkbox") {
            //const checkbox = new CheckBox(item.enabled);
            //checkbox.title = item.tooltip;    // implement tooltip with CSS
            widget = document.createElement("input");
            widget.setAttribute("type", "checkbox");
            widget.setAttribute("id", count);
            console.log(count);
            if (item.enabled) {
                widget.setAttribute("checked", "");
            }

            var checkbox_label = document.createElement("label");
            checkbox_label.setAttribute("for", count);
            if (item.value !== null && item.value !== "") {
                console.error("ERROR: has a value!!! -", item.value);
            }
            checkbox_label.textContent = item.variable;
            document.getElementById("container").appendChild(widget);
            document.getElementById("container").appendChild(checkbox_label);
            //const property_name = item.variable;
            //widget = new TreeItemContainer(checkbox, property_name, gui.Container.LAYOUT_HORIZONTAL, { display: "block", overflow: "auto" });
        } else if (item.type == "textbox") {
            widget = document.createElement("input");
            widget.setAttribute("type", "text");
            widget.setAttribute("value", item.value);
            widget.setAttribute("id", count);
            console.log(count);
            var textbox_label = document.createElement("label");
            textbox_label.setAttribute("for", count);
            textbox_label.textContent = item.variable;
            document.getElementById("container").appendChild(widget);
            document.getElementById("container").appendChild(textbox_label);
            //const textbox = new TextInput();
            //textbox.title = item.tooltip;
            //textbox.set_text(item.value);
            //const property_name = item.variable;
            //widget = new TreeItemContainer(textbox, property_name);
        }
        item.widget = widget;
        widgets.push(widget);
        document
            .getElementById("container")
            .appendChild(document.createElement("br"));
        count++;
    }
    return widgets;
}

function saveFile() {
    var preview = document.getElementById("test");
    preview.textContent = "poop";
    var fileContent = "generated config lines";
    var bb = new Blob([fileContent], { type: "text/plain" });
    var a = document.createElement("a");
    a.download = "Configuration.h"; // insert original name of file here ("_adv".h?)
    a.href = window.URL.createObjectURL(bb);
    a.click();
}

function numInput() {
    var slider = document.getElementById("amountRange");
    var numBox = document.getElementById("amountInput");
    var inputNumberStart = numBox.valueAsNumber;
    var inputNumber = 0;
    if (inputNumberStart < numBox.getAttribute("min"))
        inputNumber = numBox.getAttribute("min");
    else if (inputNumberStart > numBox.getAttribute("max"))
        inputNumber = numBox.getAttribute("max");
    else inputNumber = inputNumberStart;
    numBox.value = inputNumber;
    slider.value = inputNumber;
}
