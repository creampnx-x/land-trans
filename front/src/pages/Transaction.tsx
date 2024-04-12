import { PageContainer, ProDescriptions, ProFormRadio, ProList } from '@ant-design/pro-components';
import { Card, Drawer, Tag, message } from 'antd';
import React, { useEffect, useState } from 'react';

import LandDescription from './LandDescription';
// import { getLandInfo } from './Admin';

import TransactionInfo from './TransactionInfo';

import type { TransactionInfoType } from './TransactionInfo';

import { getLand, getTransactionListByKey } from '@/services/request';

export const statusMap: Record<string, { color: string, content: string }> = {
  '-2': {
    color: 'grey',
    content: '已取消'
  },

  '-1': {
    color: 'red',
    content: '已拒绝'
  },

  '0': {
    color: 'blue',
    content: '流转中',
  },

  '1': {
    color: 'green',
    content: '已流转'
  }
}

export function formatDateTime(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  return `${year}-${pad(month)}-${pad(day)} ${pad(hour)}:${pad(minute)}:${pad(second)}`;
}

function pad(num: number) {
  return num.toString().padStart(2, '0');
}

const queryMap = (userId: string) => {

  return {
    all: {
      key: 'person',
      value: userId
    },
    request: {
      key: 'requester',
      value: userId
    },
    recive: {
      key: 'validar',
      value: userId
    }
  }
}

const Transaction: React.FC = () => {
  const [transitions, setTransactions] = useState<any>([]);
  const [land, setLand] = useState<any>({});
  const [transaction, setTransaction] = useState<any>({});
  const [queryType, setQueryType] = useState<'all' | 'request' | 'recive'>('all');
  const [open, setOpen] = useState(false);

  const showDrawer = (value: any) => {
    setOpen(true);
    setTransaction(value);
    getLand(value.landId).then((res) => {
      if (res.status === 'ok') {
        const __data__ = JSON.parse(res.data === '' ? "{}" : res.data);

        setLand(__data__);
      } else {
        message.error(res.info);
      }
    })
  };

  const onClose = () => {
    setOpen(false);
    setLand({});
  };

  const userInfo = JSON.parse(sessionStorage.getItem('user_info')!);

  useEffect(() => {
    getTransactionListByKey(queryMap(userInfo.userid)[queryType]).then((res: any) => {
      if (res.status === 'ok') {
        const __data__ = JSON.parse(res.data === '' ? "[]" : res.data);

        setTransactions(__data__);
      } else {
        message.error(res.info);
      }
    })
  }, [queryType]);


  return (
    <PageContainer>
      <Card
        extra={(
          <div style={{ position: 'relative', top: '12px' }}>
            <ProFormRadio.Group
              radioType='button'
              label=""
              fieldProps={{
                value: queryType,
                onChange(e) {
                  console.log(e);
                  setQueryType(e.target.value);
                },
              }}
              options={[
                {
                  label: '所有的',
                  value: 'all',
                },
                {
                  label: '我发起的',
                  value: 'request',
                },
                {
                  label: '我收到的',
                  value: 'recive',
                },
              ]}
            />
          </div>
        )}
      >
        <ProList<any>
          ghost={false}
          itemCardProps={{
            ghost: false,
          }}
          pagination={false}
          showActions="hover"
          rowSelection={false}
          grid={{ gutter: 16, column: 2 }}
          onItem={(record: any) => {
            return {
              onMouseEnter: () => {
                console.log(record);
              },
              onClick: () => {
                console.log(record);
              },
            };
          }}
          metas={{
            title: {},
            subTitle: {},
            type: {},
            avatar: {},
            content: {},
            actions: {
              cardActionProps: 'extra',
            },
          }}
          headerTitle=""
          dataSource={(() => {
            return transitions.map((v: any) => {
              return {
                ...v,
                title: v.name,
                subTitle: <Tag color={statusMap[String(v.status)].color}>{statusMap[String(v.status)].content}</Tag>,
                actions: [<a key="run" onClick={() => { showDrawer(v) }}>详情</a>],
                avatar: "https://gw.alipayobjects.com/zos/antfincdn/UCSiy1j6jx/xingzhuang.svg",
                content: (
                  <div>
                    <ProDescriptions
                      column={2}
                    >
                      <ProDescriptions.Item label="发起流转人" valueType="text">
                        {v.requester}
                      </ProDescriptions.Item>
                      <ProDescriptions.Item label="土地拥有人" valueType="text">
                        {v.validar}
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
                        {v.transactionId}
                      </ProDescriptions.Item>

                      <ProDescriptions.Item
                        label="土地 ID"
                        valueType="text"
                      >
                        {v.landId}
                      </ProDescriptions.Item>

                      <ProDescriptions.Item label="出价" valueType="money">
                        {v.price}
                      </ProDescriptions.Item>

                      <ProDescriptions.Item label="日期" valueType="text">
                        {formatDateTime(new Date(Number(v.date)))}
                      </ProDescriptions.Item>
                    </ProDescriptions>
                  </div>
                )
              }
            })
          })()}
        />
      </Card>

      <Drawer title="交易详情" onClose={onClose} open={open} width={800}>
        <TransactionInfo transaction={transaction} />

        <LandDescription land={land} />
      </Drawer>


    </PageContainer>
  );
};

export default Transaction;
