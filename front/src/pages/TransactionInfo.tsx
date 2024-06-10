import { ProDescriptions } from "@ant-design/pro-components";
import { Button, Image, message } from "antd";
import { formatDateTime } from "./Transaction";
import { UpdateTransaction } from "@/services/request";

export type TransactionInfoType = {
    transactionId: string,
    name: string,
    landId: string,
    date: string,
    price: number,
    requester: string,
    validar: string,
    isValid: string,
    status: string
}

function TransactionInfo(props: { transaction: TransactionInfoType, title?: string | null }) {
    const { transaction, title } = props;

    const userInfo = JSON.parse(sessionStorage.getItem('user_info')!);

    if (!transaction.transactionId)
        return null;

    // console.log('neibu' , transaction);
    const actionForTransaction = (action: string) => {
        UpdateTransaction({
            transactionId: transaction.transactionId,
            status: action,
            requester: transaction.requester,
            validar: transaction.validar,
        }).then((res) => {
            if (res.status !== 'ok')
                message.error(res.info);
        })
    }

    return (

        <div>
            <ProDescriptions
                column={2}
                title={title === undefined ? '流转信息' : title}
                extra={(
                    <>
                        {transaction.status === '0' && userInfo?.userid === transaction.requester &&
                            <Button color="error" type="primary" onClick={() => actionForTransaction('-2')}>
                                取消流转
                            </Button>}
                        {transaction.status === '0' && userInfo?.userid === transaction.validar &&
                            <>
                                <Button danger onClick={() => actionForTransaction('-1')}>
                                    拒绝流转
                                </Button>
                                <Button type="primary" onClick={() => actionForTransaction('1')}>
                                    同意流转
                                </Button>
                            </>}
                    </>
                )}
            >
                <ProDescriptions.Item
                    label="状态"
                    valueEnum={{
                        '-2': { text: '已取消', status: 'Default' },
                        '-1': {
                            text: '已拒绝',
                            status: 'Error',
                        },
                        '0': {
                            text: '流转中',
                            status: 'Processing',
                        },
                        '1': {
                            text: '已流转',
                            status: 'Success',
                        }
                    }}
                >
                    {transaction.status}
                </ProDescriptions.Item>

                <ProDescriptions.Item label="发起流转人" valueType="text">
                    {transaction.requester}
                </ProDescriptions.Item>
                <ProDescriptions.Item label="土地拥有人" valueType="text">
                    {transaction.validar}
                </ProDescriptions.Item>


                <ProDescriptions.Item
                    span={1}
                    valueType="text"
                    contentStyle={{
                        // maxWidth: '80%',
                    }}
                    ellipsis
                    label="流转 ID"
                >
                    {transaction.transactionId}
                </ProDescriptions.Item>

                <ProDescriptions.Item
                    label="土地 ID"
                    valueType="text"
                >
                    {transaction.landId}
                </ProDescriptions.Item>

                <ProDescriptions.Item label="出价" valueType="money">
                    {transaction.price}
                </ProDescriptions.Item>

                <ProDescriptions.Item label="日期" valueType="text">
                    {formatDateTime(new Date(Number(transaction.date)))}
                </ProDescriptions.Item>
            </ProDescriptions>

        </div >
    )
}

export default TransactionInfo;