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
            this.dropdownOptions =
                regex_match.groups.special_comment_line.split(", "); // check for colon for key:value pairs
        } else {
            this.dropdownOptions = undefined;
        }
        this.commentText = regex_match.groups.comment_text;
    }
}

class Label {
    // check for links in block and line comments: https://stackoverflow.com/questions/49634850/convert-plain-text-links-to-clickable-links?answertab=trending#tab-top
    constructor(type = "line", text = "") {
        this.htmlElement = document.createElement("label");
        this.text = text;
        if (type === "block") {
            this.text = "";
            this.htmlElement.setAttribute("class", "block_comment");
        } else if (type === "at_header") {
            this.htmlElement.setAttribute("class", "at_header");
            this.finalize();
        } else if (type === "equals_header") {
            this.htmlElement.setAttribute("class", "equals_header");
            this.finalize();
        } else if (type === "line") {
            this.htmlElement.setAttribute("class", "line_comment");
            this.finalize();
        } else {
            console.error("Bad label type: " + type);
        }
    }
    addLine(new_line) {
        this.text += new_line + "\r\n";
    }
    finalize() {
        this.htmlElement.textContent = this.text;
    }
}

class HideableContainer {
    /* will need to also store a reference to each widget so it can check each one's value
     *      whenever checkCondition is called
     * to change details open (or checkbox checked or disabled) attribute, must use
     *      .setAttribute("open", "") to open and .removeAttribute("open") to close
     * 
     * TODO: lines 160, 164, 169 need addressed
     * #if TEMP_SENSOR_IS_MAX_TC(1)
     * #if HAS_E_TEMP_SENSOR
     */
    constructor() {
        this.htmlElement = document.createElement("details");
        this.conditionWidgets = [];
    }
    addElement(element) {
        this.htmlElement.append(element);
    }
    setCondition({
        type,
        enabledType,
        enabledTypeVars,
        conditionVariable,
        operator = "",
        conditionValue = ""
    } = {}) {
        if (type === "enabledType") {
            this.enabledType = enabledType;
            this.enabledTypeVars = enabledTypeVars;
            let title = document.createElement("summary");
            title.textContent = enabledType + "(" + enabledTypeVars + ")";
            this.htmlElement.append(title);
        } else if (type === "condition") {
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
            if (operator === "(") {
                title.textContent += ")";
            }
            this.htmlElement.append(title);
        }
        this.type = type;
    }
    addConditionWidget(widget) {
        this.conditionWidgets.push(widget);
    }
    checkCondition() {
        if (this.type === "enabledType") {
            for (const widget of this.conditionWidgets) {
                if (["ENABLED", "ANY"].includes(this.enabledType)) {
                    this.htmlElement.removeAttribute("open", "");
                    if (widget.isEnabled()) {
                        this.htmlElement.setAttribute("open", "");
                        break;
                    }
                } else if (this.enabledType === "ALL") {
                    this.htmlElement.setAttribute("open", "");
                    if (!widget.isEnabled()) {
                        this.htmlElement.removeAttribute("open", "");
                        break;
                    }
                } else if (this.enabledType === "DISABLED") {
                    this.htmlElement.setAttribute("open", "");
                    if (widget.isEnabled()) {
                        this.htmlElement.removeAttribute("open", "");
                        break;
                    }
                } else {
                    console.error(
                        "Unknown enabledType for hideable container: " +
                            this.enabledType
                    );
                }
            }
        } else if (this.type === "condition") {
            const widget = this.conditionWidgets[0];
            if (this.operator === "NO OPERATOR") {
                this.htmlElement.removeAttribute("open", "");
                if (widget.isEnabled()) {
                    this.htmlElement.setAttribute("open", "");
                }
            } else if (this.operator === "(") {
                this.htmlElement.removeAttribute("open", "");
                if (widget.getValue() === Number(this.conditionValue)) {
                    this.htmlElement.setAttribute("open", "");
                }
            } else if (this.operator === "<") {
                this.htmlElement.removeAttribute("open", "");
                if (widget.getValue() < Number(this.conditionValue)) {
                    this.htmlElement.setAttribute("open", "");
                }
            } else if (this.operator === ">") {
                this.htmlElement.removeAttribute("open", "");
                if (widget.getValue() > Number(this.conditionValue)) {
                    this.htmlElement.setAttribute("open", "");
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
        this.htmlElement = document.createElement("div");
        this.htmlElement.setAttribute("class", "widgetBase");
        this.isDisabled = isDisabled;
        this.containers = [];
        this.changed = false;
        if (isDisabled === true || type === "checkbox") {
            let checkbox = document.createElement("input");
            checkbox.setAttribute("type", "checkbox");
            if (isDisabled === false) {
                console.log("Checkbox disabled = false: " + variableName);
                checkbox.setAttribute("checked", "");
            }
            this.htmlElement.append(checkbox);
        }
        let label = document.createElement("label");
        label.textContent = variableName;
        this.htmlElement.append(label);
        if (type === "dropdown") {
            // if contains a colon then it is in value:'display_text' format
            let dropdownElement = document.createElement("select");
            let foundValue = false;
            for (const option of dropdownOptions) {
                let o = document.createElement("option");
                o.textContent = option;
                if (!foundValue && option === value) {
                    foundValue = true;
                    o.setAttribute("selected", "");
                }
                dropdownElement.append(o);
            }
            if (!foundValue) {
                console.error("Selected dropdown option not in list!");
            }
            this.htmlElement.append(dropdownElement);
        } else if (type === "multiple") {
        } else if (type === "text_box") {
            let textbox = document.createElement("input");
            textbox.setAttribute("type", "text");
            textbox.setAttribute("value", value);
            this.htmlElement.append(textbox);
        } else if (type === "other") {
            /*
            Possible values:
            02010300, Version.h, BOARD_BTT_SKR_MINI_E3_V3_0, 128
            */
        }
    }
    addTooltip(tooltipText) {
        // TODO: this function is already called appropriately, just needs code
    }
    addContainer(container) {
        this.containers.push(container); //on widget value change, call container.check()
    }
    isEnabled() {
        return !this.isDisabled;
    }
    getValue() {
        // handle type conversion like Number()
        if (type === "checkbox") return this.htmlElement.value;
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
                /^(?<whitespace>[ \t]*)(?:(?<is_block_comment>\/\*\*|\*\/|\*)|(?:(?<is_line_comment>\/\/)?(?:=*(?<equals_header>(?<=[=])[\w >\/\-()]*(?=[=]))=*)?(?:[ ]?@section[ ](?<at_header>(?<=@section )[\w ]*))?)(?:(?<end_of_line>$)|(?<has_hashtag>#)?(?<pragma_line>pragma \w*)?(?:(?<if_statement>ifndef|ifdef|if|elif)[ ](?:(?<enabled_type>ENABLED|DISABLED|EITHER|ANY|BOTH|ALL)[(](?<enabled_type_vars>(?<=[(]).*(?=[)]))[)]|(?<condition_variable>\w*)[ ]?(?<operator>[<>(]*)?[ ]?(?<condition_value>\w*)?[)]?))?(?:(?<is_define>define)[ ]?(?<variable>\w*)(?<space_from_var_to_next>[ ]*)(?<has_bracket>[{])?(?<has_paren>[(])?(?<has_quote>[\"\'])?[ ]?(?<value>(?:(?<=[{][ ]?)(?:(?!\/\/).)*(?=\})|(?:(?<=[(])(?:(?!\/\/).)*(?=\))|(?:(?<=[\"\']).*?(?:(?=\")|(?=\'))|[-.\w]*))))[})\"\']?)?(?<endif>endif)?(?<space_to_comment>[ ]*)(?<has_line_end_comment>\/\/)?))[ ]?(?::\[)?(?<special_comment_line>(?<=:\[).*(?=\]))?\]?(?<comment_text>.*)?/;
            // https://regex101.com/r/3GU3om
            // [(]@.*?\n[ ]*[)][?]   < use in Notepad++ replace all
            var lines = full_text.split(/\r\n|\n/);
            lines.forEach((line) => {
                var matchedLine = line.match(re);
                var lineObject = new Line(matchedLine);
                matches.push(lineObject);
            });
            //make_widgets(matches);
            let elements = make_widgets2(matches);
            for (const element of elements) {
                document
                    .getElementById("container")
                    .appendChild(element.htmlElement);
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
    let count = 0;
    for (const [index, line] of lines.entries()) {
        if (line.isBlockComment) {
            if (line.isBlockComment === "/**") {
                blockLabel = new Label("block");
            } else if (line.isBlockComment === "*") {
                if (line.dropdownOptions) {
                    console.log(
                        index + " - Found dropdown options in block comment."
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
            } else if (line.isBlockComment === "*/") {
                if (blockLabel === null) {
                    console.error("Block comment label does not exist.");
                } else {
                    blockLabel.finalize();
                    htmlElements.push(blockLabel);
                    blockLabel = null;
                }
            }
        } else if (line.isLineComment && !line.isDefine) {
            let lineLabel = null;
            if (line.atHeader) {
                lineLabel = new Label("at_header", line.atHeader);
            } else if (line.equalsHeader) {
                lineLabel = new Label("equals_header", line.equalsHeader);
            } else {
                lineLabel = new Label("line", line.commentText);
            }
            htmlElements.push(lineLabel);
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
                    lineEnabledTypeVars = line.conditionVariable;
                } else if (line.ifStatement == "ifndef") {
                    lineEnabledType = "DISABLED";
                    lineEnabledTypeVars = line.conditionVariable;
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
                if (line.enabledTypeVars !== undefined) {
                    for (const typeVariable of line.enabledTypeVars) {
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
                            newContainer.addConditionWidget(
                                foundWidget.htmlElement
                            );
                        }
                    }
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
                    newContainer.addConditionWidget(foundWidget);
                }
            }
            //newContainer.checkCondition();    //TODO: enable this and fix error
            hideableContainers.push(newContainer);
            if (hideableContainers.length > 1) {
                // check if this is working (.htmlElement)
                // line 155 of sample.h displays incorrectly
                hideableContainers[hideableContainers.length - 2].addElement(hideableContainers[hideableContainers.length - 1].htmlElement);
            } else {
                htmlElements.push(hideableContainers[hideableContainers.length - 1]);
            }
            
            // to get last: hideableContainers[hideableContainers.length - 1]
        } else if (line.endif) {
            if (hideableContainers.pop() === undefined) {
                console.error(index + " - More endifs than ifs!");
            }
        } else if (line.isDefine) {
            count++;
            var widget = null;
            var isDisabled = false;
            if (line.isLineComment) {
                isDisabled = true;
            }
            if (line.dropdownOptions || blockCommentDropdownOptions !== null) {
                // Also need to check if current variable ends in _#, if so check if beginning of name has a dropdown list and apply same options
                console.log(
                    count + " - Applying dropdown options to " + line.variable
                );
                let dropdownOptions = [];
                if (blockCommentDropdownOptions !== null) {
                    dropdownOptions = blockCommentDropdownOptions;
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
            } else if (!line.value || line.value === "") {
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
                    type: "text_box",
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
                hideableContainers[hideableContainers.length - 1].addElement(widget.htmlElement);
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
        if (item.type === "label") {
            const standalone = item.isBlockComment !== null;
            const header = item.atHeader !== null || item.equalsHeader !== null;
            widget = document.createElement("label");
            widget.textContent = item.labelText;
            document.getElementById("container").appendChild(widget);
        } else if (item.type === "checkbox") {
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
        } else if (item.type === "text_box") {
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
