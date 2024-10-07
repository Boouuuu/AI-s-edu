
function checkOutputsForErrors() {
    // 对当前选中的输出单元格的内容进行提取
    // const error=document.querySelector('.cell .code_cell .rendered  .selected .output_area span')
    //const error=document.querySelectorAll('.output .output_area .output_subarea.output_text.output_error pre span')
    const selected = document.querySelector('.container .cell.code_cell.rendered.selected')
    const output = selected.querySelector('.output_wrapper .output .output_area')
    const error = output.querySelectorAll('.output_subarea.output_text.output_error span')
    let errors = []
    error.forEach((errorText, index) => {
        const errortext = errorText.innerText || code.textContent
        console.log(`Error in cell ${index + 1}:`, errortext)
        if (errortext) {
            errors.push(errortext)
        }
        else {
            console.log(`Error cell ${index + 1} is empty or not found.`)
        }
    })
    console.log(`Collected ${errors.length} errors.`);
    callLargeModelForHelp(errors)


}
let htmlContent;
function callLargeModelForHelp(error) {
    const Error = error.join(',');
    const userinput = `我遇到了错误${Error}，请帮我分析原因以及解决方法，谢谢！`
    console.log(Error);
    console.log(userinput);
    chrome.runtime.sendMessage({ message: 'generate_text', UserInput: userinput },
        (response) => {
            htmlContent = response.data;
            console.log(2);

            console.log(htmlContent);

        });

}



chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'Real_time_monitoring') {
        console.log(1);

        checkOutputsForErrors();
        sendResponse({ Data: htmlContent }); // 发送响应  
    }
    return true;
})

