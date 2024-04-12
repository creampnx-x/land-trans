import { cityArray } from "@/data/city";
import { UpdateFile, createLand } from "@/services/request";
import { ModalForm, ProFormCascader, ProFormText, ProFormTextArea, ProFormUploadButton } from "@ant-design/pro-components";
import { message } from "antd";


export const hashFunction = (str: string, seed = 0) => {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for(let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1  = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2  = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
  };
  

const LandRegister = (props: any) => {
    const { reload, createModalOpen, setCreateModalOpen } = props;

    const createLandHandler = async (value: any) => {
        const formData = new FormData();

        console.log(value);
        formData.append("file", value['upload'][0].originFileObj)

        const res = await UpdateFile(formData);

        if (res.status !== 'ok') {
            message.error(res.info);
            return;
        }

        const url = "http://localhost:8080/land/file/" + res.data;

        const userInfo = JSON.parse(sessionStorage.getItem('user_info')!)

        // delete value['update']
        return createLand({
            ...value,
            owner: userInfo.userid,
            image: url,
            valid: 'No',
            inTransaction: "false",
            position: value.position + ":" + value['position-detail'],
            landId: hashFunction(value.position + ":" + value['position-detail']).toString()
        })
    };

    return (
        <ModalForm
            title="土地登记"
            width="500px"
            open={createModalOpen}
            onOpenChange={(visible) => {
                setCreateModalOpen(visible);
            }}
            modalProps={{
                destroyOnClose: true
            }}
            onFinish={async (value) => {
                const res = await createLandHandler(value as any);
                if (res.status === 'ok') {
                    setCreateModalOpen(false);
                    reload();
                }
            }}
        >

            <ProFormCascader
                name="position"
                label="位置"
                fieldProps={{
                    options: cityArray
                }}
                rules={[
                    {
                        required: true,
                        message: "位置 是必填项"
                    },
                ]}
                width="lg"
            />


            <ProFormText
                rules={[
                    {
                        required: true,
                        message: "详细位置 是必填项"
                    },
                ]}
                width="lg"
                name="position-detail"
                label="详细位置"
                placeholder="在土地产权证书上的详细位置"
            />


            <ProFormText
                rules={[
                    {
                        required: true,
                        message: "经纬度 是必填项"
                    },
                ]}
                width="lg"
                name="lng"
                label="经纬度"
                placeholder="以逗号隔开，以土地东北角为准"
            />

            <ProFormText
                rules={[
                    {
                        required: true,
                        message: "大小 是必填项"
                    },
                ]}
                width="lg"
                name="size"
                label="大小"
                placeholder="土地的大小，以㎡为单位"
                fieldProps={{
                    addonAfter: 'm²'
                }}
            />

            <ProFormText
                rules={[
                    {
                        required: true,
                        message: "定价 是必填项"
                    },
                ]}
                width="lg"
                name="price"
                label="定价"
                placeholder="标价"
                fieldProps={{
                    addonAfter: '元'
                }}
            />

            <ProFormUploadButton
                title="上传相关证明文件"
                name="upload"
                label="证明文件"
                max={2}
                fieldProps={{
                    name: 'file',

                }}
                accept="image/png, image/jpeg"
                rules={[
                    {
                        required: true,
                        message: "证明文件 是必填项"
                    },
                ]}
                extra="上传过往土地流转手续或卫星地图照片进行验证"
            />

        </ModalForm>

    )
}

export default LandRegister;