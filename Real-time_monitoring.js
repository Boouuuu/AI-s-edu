
function checkOutputsForErrors() {
    // 对当前选中的输出单元格的内容进行提取
    // const error=document.querySelector('.cell .code_cell .rendered  .selected .output_area span')
    //const error=document.querySelectorAll('.output .output_area .output_subarea.output_text.output_error pre span')
    const selected = document.querySelector('.container .cell.code_cell.rendered.selected')
    const output = selected.querySelector('.output_wrapper .output .output_area')
    const error = output.querySelectorAll('.output_subarea.output_text.output_error span')
    let errors = []
    if (error) {
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
    // console.log('222');
    
    // const selection = window.getSelection();
    // const selectedOutputCells = Array.from(document.querySelectorAll('.cell .selected .output_area'))
    //     .filter(cell => selection.rangeCount > 0 && selection.containsNode(cell, true));

    // // 打印选中的输出块内容
    // selectedOutputCells.forEach(cell => {
    //     console.log(cell.innerText); // 或使用 cell.textContent
    // });


}
let htmlContent;
function callLargeModelForHelp(error) {
    if (error) {
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
    else {
        console.log('无需问询！');

    }

}



chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'Real_time_monitoring') {
        console.log('111');

        checkOutputsForErrors();
        sendResponse({ Data: htmlContent }); // 发送响应  
        htmlContent = '';
    }
    return true;
})

