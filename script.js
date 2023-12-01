var matches = [];

class Line {
    constructor(regex_match) {
        this.widget = null;
        this.changed = false;
        this.enabled = true;
        this.tooltip = null;
        this.raw_line = regex_match[0];
        this.begin_whitespace = regex_match.groups.whitespace;
        this.is_block_comment = regex_match.groups.is_block_comment;
        this.is_line_comment = regex_match.groups.is_line_comment;
        this.equals_header = regex_match.groups.equals_header;
        this.at_header = regex_match.groups.at_header;

        this.has_hashtag = regex_match.groups.has_hashtag;
        this.pragma_line = regex_match.groups.pragma_line;

        this.if_statement = regex_match.groups.if_statement;
        this.is_boolean = regex_match.groups.is_boolean;
        this.boolean_vars = regex_match.groups.boolean_vars;
        this.condition_variable = regex_match.groups.condition_variable;
        this.operator = regex_match.groups.operator;
        this.condition_value = regex_match.groups.condition_value;

        this.is_define = regex_match.groups.is_define;
        this.variable = regex_match.groups.variable;
        this.space_from_var_to_next = regex_match.groups.space_from_var_to_next;
        this.has_bracket = regex_match.groups.has_bracket;
        this.has_paren = regex_match.groups.has_paren;
        this.has_quote = regex_match.groups.has_quote;
        this.value = regex_match.groups.value;

        this.endif = regex_match.groups.endif;
        this.space_to_comment = regex_match.groups.space_to_comment;
        this.has_line_end_comment = regex_match.groups.has_line_end_comment;

        this.special_comment_line = regex_match.groups.special_comment_line;
        this.comment_text = regex_match.groups.comment_text;

        this.type = null;
        if (
            this.is_block_comment ||
            (this.is_line_comment && !this.is_define)
        ) {
            document.getElementById("test").innerHTML += "\nlabel";
            this.type = "label";
            this.label_text =
                this.at_header ||
                this.equals_header ||
                this.special_comment_line ||
                this.comment_text;
        } else {
            if (this.pragma_line) {
                document.getElementById("test").innerHTML += "<br />label";
                this.type = "label";
                this.label_text = this.raw_line;
            } else if (this.is_define) {
                if (this.is_line_comment) {
                    this.enabled = false;
                }
                if (!this.value || this.value === "") {
                    document.getElementById("test").innerHTML +=
                        "<br />check_box";
                    this.type = "check_box";
                } else if (this.has_bracket || this.has_paren) {
                    document.getElementById("test").innerHTML +=
                        "<br />multiple";
                    this.type = "multiple";
                } else if (this.has_quote) {
                    document.getElementById("test").innerHTML +=
                        "<br />text_box";
                    this.type = "text_box";
                } else {
                    document.getElementById("test").innerHTML +=
                        "<br />text_box";
                    this.type = "text_box";
                }
            }
            if (this.has_line_end_comment) {
                this.tooltip = this.comment_text;
            }
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
                /^(?<whitespace>[ \t]*)(?:(?<is_block_comment>\/\*\*|\*\/|\*)|(?:(?<is_line_comment>\/\/)?(?:=*(?<equals_header>(?<=[=])[\w >\/\-()]*(?=[=]))=*)?(?:[ ]?@section[ ](?<at_header>(?<=@section )[\w ]*))?)(?:(?<end_of_line>$)|(?<has_hashtag>#)?(?<pragma_line>pragma \w*)?(?:(?<if_statement>ifndef|ifdef|if|elif)[ ](?:(?<is_boolean>ENABLED|DISABLED|EITHER|ANY|BOTH)[(](?<boolean_vars>(?<=[(]).*(?=[)]))[)]|(?<condition_variable>\w*)[ ]?(?<operator>[<>=]*)?[ ]?(?<condition_value>\w*)?))?(?:(?<is_define>define)[ ]?(?<variable>\w*)(?<space_from_var_to_next>[ ]*)(?<has_bracket>[{])?(?<has_paren>[(])?(?<has_quote>[\"\'])?[ ]?(?<value>(?:(?<=[{][ ]?).*(?=\})|(?:(?<=[(]).*(?=\))|(?:(?<=[\"\']).*?(?:(?=\")|(?=\'))|[-.\w]*))))[})\"\']?)?(?<endif>endif)?(?<space_to_comment>[ ]*)(?<has_line_end_comment>\/\/)?))[ ]?(?<special_comment_line>(?=:\[).*)?(?<comment_text>.*)?/;
            var lines = full_text.split(/\r\n|\n/);
            lines.forEach((line) => {
                var matchedLine = line.match(re);
                var lineObject = new Line(matchedLine);
                matches.push(lineObject);
            });
            make_widgets(matches);
        };
        reader.readAsText(file); // https://regex101.com/r/3GU3om
        //make_widgets(matches);
    } else {
        alert("Your browser is too old to support the HTML5 File API.");
    }
}

function make_widgets(items) {
    document.getElementById("test").innerHTML += "<br />making widgets";
    const widgets = [];
    var count = 0;
    for (const item of items) {
        let widget = null;
        if (item.type === "label") {
            const standalone = item.is_block_comment !== null;
            const header =
                item.at_header !== null || item.equals_header !== null;
            widget = document.createElement("label");
            //newlabel.setAttribute("for", id_from_input);
            widget.innerHTML = item.label_text;
            document.getElementById("container").appendChild(widget);
        } else if (item.type === "check_box") {
            //const checkbox = new CheckBox(item.enabled);
            //checkbox.title = item.tooltip;    // implement tooltip with CSS
            widget = document.createElement("input");
            widget.setAttribute("type", "checkbox");
            widget.setAttribute("id", count);
            if (item.enabled) {
                widget.setAttribute("checked", item.enabled);
            }

            var _label = document.createElement("label");
            _label.setAttribute("for", count);
            if (item.value !== null && item.value !== "") {
                console.error("ERROR: has a value!!! -", item.value);
            }
            checkbox_label.innerHTML = item.variable;
            document.getElementById("container").appendChild(widget);
            document.getElementById("container").appendChild(checkbox_label);
            //const property_name = item.variable;
            //widget = new TreeItemContainer(checkbox, property_name, gui.Container.LAYOUT_HORIZONTAL, { display: "block", overflow: "auto" });
        } else if (item.type === "text_box") {
            widget = document.createElement("input");
            widget.setAttribute("type", "text");
            widget.setAttribute("value", item.value);
            widget.setAttribute("id", count);
            var textbox_label = document.createElement("label");
            textbox_label.setAttribute("for", count);
            textbox_label.innerHTML = item.variable;
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
    preview.innerHTML = "poop";
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
