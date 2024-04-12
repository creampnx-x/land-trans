
import { createTransaction } from "@/services/request";
import { ModalForm, ProFormText, } from "@ant-design/pro-components";
import { hashFunction } from "./LandRegister";
import { message } from "antd";

// export type TransactionInfo = {
//     transitionId: string,
//     name: string,
//     landId: string,
//     date: string,
//     price: number,
//     requester: string,
//     validar: string,
//     isValid: string,
//     status: string
// }


const CreateTransaction = (props: any) => {
    const { land, createModalOpen, setCreateModalOpen } = props;

    const userInfo = JSON.parse(sessionStorage.getItem('user_info')!)


    const createTransactionHandler = (value: any) => {
        if (userInfo.userid === land['owner']) {
            message.error("不能向自己的土地申请交易！")
            return new Promise<any>((resolve, _) => {
                resolve({
                    status: 'fail'
                })
            })
        }

        if (land.valid === 'No' || land.inTransaction === 'true') {
            message.error("土地未通过审核或已经在交易中了!")
            return new Promise<any>((resolve, _) => {
                resolve({
                    status: 'fail'
                })
            })
        }

        return createTransaction({
            ...value,
            landId: land.landId,
            transactionId: hashFunction(land.landId + value.price + Date.now().toString()).toString(),
            requester: userInfo.userid,
            validar: land.owner,
            isValid: 'false',
            status: '0',
            date: Date.now().toString(),
            name: land.position,
            person: userInfo.userid
        });
    };

    return (
        <ModalForm
            title="发起交易"
            width="500px"
            open={createModalOpen}
            onOpenChange={(visible) => {
                setCreateModalOpen(visible);
            }}
            modalProps={{
                destroyOnClose: true
            }}
            onFinish={async (value) => {
                const res = await createTransactionHandler(value as any);
                if (res.status === 'ok') {
                    setCreateModalOpen(false);
                    // 跳转到 我的资产页面
                    // reload();
                }
            }}
        >

            <ProFormText
                rules={[
                    {
                        required: true,
                        message: "定价 是必填项"
                    },
                ]}
                width="lg"
                name="price"
                label="出价"
                placeholder="标价"
                fieldProps={{
                    addonAfter: '元'
                }}
            />



        </ModalForm>

    )
}

export default CreateTransaction;