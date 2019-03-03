import { enableRipple } from '@syncfusion/ej2-base';
enableRipple(true);
import { Uploader } from '@syncfusion/ej2-inputs';

let preloadFiles: any = [
    {name: 'PHP Succinctly', size: 500000, type: '.docx'},
    {name: 'TypeScript Succintly', size: 12000, type: '.pdf'},
];

let uploadObj: Uploader = new Uploader({
    autoUpload: false,
    asyncSettings: {
        saveUrl: 'https://aspnetmvc.syncfusion.com/services/api/uploadbox/Save',
        removeUrl: 'https://aspnetmvc.syncfusion.com/services/api/uploadbox/Remove'
    },
    files: preloadFiles,
});
uploadObj.appendTo('#fileupload');
