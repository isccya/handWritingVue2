const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 他匹配到的分组是一个 标签名  <xxx 匹配到的是开始 标签的名字
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`);  // 匹配的是</xxxx>  最终匹配到的分组就是结束标签的名字
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;  // 匹配属性
// 第一个分组就是属性的key value 就是 分组3/分组4/分组五
const startTagClose = /^\s*(\/?)>/;  // <div> <br/>

// vue3 采用的不是使用正则
// 对模板进行编译处理  
export function parseHTML(html) {

    const ELEMENT_TYPE = 1;
    const TEXT_TYPE = 3;
    const stack = []; // 用于存放元素的
    let currentParent; // 指向的是栈中的最后一个
    let root;

    function createASTElement(tag, attrs) {
        return {
            tag,
            type: ELEMENT_TYPE,
            children:[],
            attrs,
            parent: null
        }
    }

    function start(tag, attrs) {
        let node = createASTElement(tag, attrs) //创建一个ast节点
        if (!root) { //没有根节点,当前元素就是根节点
            root = node
        }
        if (currentParent) {
            node.parent = currentParent //子知父
            currentParent.children.push(node) //父知子
        }
        stack.push(node)
        currentParent = node //父节点为栈中最后一个元素
    }

    function chars(text) { //文本放到当前指向的节点
        text = text.replace(/\s/g,''); 
        text && currentParent.children.push({
            type: TEXT_TYPE,
            text,
            parent:currentParent
        })

    }

    function end(tag) {
        stack.pop() //弹出最后一个
        currentParent = stack[stack.length - 1]

    }

    // 模板解析完多少,就前进多少
    function advance(n) {
        html = html.substring(n)
    }

    // 解析开始标签及其里面的属性
    function parseStartTag() {
        const start = html.match(startTagOpen)
        // 1.匹配到开始标签
        if (start) {
            const match = {
                tagName: start[1], //标签名
                attrs: []
            }
            advance(start[0].length);
            // 2.如果不是开始标签的结束,就一直匹配属性,把属性值放入match.attrs中
            let attr, end;
            while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
                advance(attr[0].length)
                match.attrs.push({ name: attr[1], value: attr[3] || attr[4] || attr[5] } || true)
            }
            // 3.匹配到结束符号
            if (end) {
                advance(end[0].length)
            }
            return match
        }
        return false //不是开始标签
    }


    while (html) {
        // 如果textEnd 为0 说明是一个开始标签或者结束标签
        // 如果textEnd > 0说明就是文本的结束位置
        let textEnd = html.indexOf('<');  // 如果indexOf中的索引是0 则说明是个标签
        if (textEnd === 0) {
            const startTagMatch = parseStartTag() //开始标签的匹配
            if (startTagMatch) {
                start(startTagMatch.tagName, startTagMatch.attrs)
                continue
            }
            let endTagMatch = html.match(endTag)
            if (endTagMatch) {
                end(endTagMatch[1])
                advance(endTagMatch[0].length)
                continue
            }

        }
        if (textEnd > 0) {
            let text = html.substring(0, textEnd) //文本内容
            if (text) {
                chars(text)
                advance(text.length) //解析到的文本
            }
        }
    }
    return root;
}