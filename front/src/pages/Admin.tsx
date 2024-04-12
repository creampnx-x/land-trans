import { PageContainer, ProDescriptions, ProList } from '@ant-design/pro-components';
import { Button, Card, Tag, Image, message, Drawer } from 'antd';
import React, { useEffect, useState } from 'react';
import LandRegister from './LandRegister';
import LandDescription from './LandDescription';
import TransactionInfo from './TransactionInfo';
import { getLandListByKey, getTransactionListByKey } from '@/services/request';

// export const getLandInfo: Promise<any> = new Promise(r => {
//   r({
//     status: 'ok',
//     info: '',
//     data: [{
//       landId: '45678',
//       owner: 'pinxue',
//       position: '北京市-海淀区-清华东路-35号',
//       valid: 'Yes',
//       lng: '40.198334, 116.038304',
//       inTransaction: 'false',
//       image: 'http://localhost:8000/map-1.png',
//       price: 5000,
//       size: 3000
//     }]
//   })
// })

const Admin: React.FC = () => {
  const [land, setLand] = useState<any>([]);
  const [showRegister, setShowRegister] = useState<boolean>(false);
  const [reload, setReload] = useState<boolean>(false);

  const [currentRow, setCurrentRow] = useState<any>();
  const [showDetail, setShowDetail] = useState<boolean>();
  const [transitions, setTransactions] = useState<any>();


  const userInfo = JSON.parse(sessionStorage.getItem('user_info')!);

  useEffect(() => {
    getLandListByKey({
      key: 'owner',
      value: userInfo.userid
    }).then((res) => {
      if (res.status === 'ok') {
        const __data__ = JSON.parse(res.data === '' ? "[]" : res.data);

        const data = __data__.map((v: any) => {
          return {
            ...v,
            title: v.position,
          }
        })
        setLand(data);
      } else {
        message.error(res.info);
      }
    })
  }, [reload]);


  useEffect(() => {
    // console.log('rereqq', currentRow)
    if (!currentRow || !currentRow.landId)
      return;

    getTransactionListByKey({
      key: 'landId',
      value: currentRow.landId
    }).then((res) => {
      console.log(res);
      if (res.status !== 'ok')
        message.error(res.info)
      else {
        const __data__ = JSON.parse(res.data === '' ? "[]" : res.data);
        setTransactions(__data__);
      }
    });

  }, [showDetail])

  return (
    <PageContainer
    >
      <Card>
        <ProList
          toolBarRender={() => {
            return [
              <Button disabled={userInfo.userid === 'admin'} key="3" type="primary" onClick={() => { setShowRegister(true) }}>
                登记土地
              </Button>,
            ];
          }}
          itemLayout="vertical"
          rowKey="id"
          headerTitle="你的土地"
          dataSource={land as any}
          metas={{
            title: {
              render(dom, entity: any) {
                return (
                  <div onClick={() => {
                    setShowDetail(true);
                    setCurrentRow(entity);
                  }}>
                    {dom}
                  </div>
                )
              },
              fieldProps: {
                onClick: () => {

                }
              }
            },
            description: {
              render: (_, entity: any) => {
                return (
                  <>
                    <Tag color={entity.valid === 'Yes' ? "green" : "red"}> {entity.valid === 'Yes' ? "通过验证" : "未验证"} </Tag>
                    <Tag color={entity.inTransaction === 'false' ? "blue" : "red"}>{entity.inTransaction === 'false' ? "非交易中" : "交易中"}</Tag>
                  </>
                )
              }
            },
            extra: {
              render: (_: any, entity: any) => (
                <Image
                  width={272}
                  alt="logo"
                  src={entity.image}
                />
              ),
            },
            content: {
              render: (_: any, entity: any) => {
                return (
                  <div>
                    <ProDescriptions
                      column={2}
                    >

                      <ProDescriptions.Item
                        span={1}
                        valueType="text"
                        contentStyle={{
                          // maxWidth: '80%',
                        }}
                        ellipsis
                        label="Land ID"
                      >
                        {entity.landId}
                      </ProDescriptions.Item>

                      <ProDescriptions.Item
                        label="经纬度"
                        tooltip="以土地东北角为准"
                        valueType="text"
                      >
                        {entity.lng}
                      </ProDescriptions.Item>

                      <ProDescriptions.Item label="标价" valueType="money">
                        {entity.price}
                      </ProDescriptions.Item>

                      <ProDescriptions.Item label="大小" valueType="text">
                        {entity.size} m²
                      </ProDescriptions.Item>
                    </ProDescriptions>
                  </div>
                );
              },
            }
          }}
        />
      </Card>

      <LandRegister createModalOpen={showRegister} setCreateModalOpen={(v: boolean) => setShowRegister(v)} reload={() => setReload(!reload)} />

      <Drawer
        width={600}
        open={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        {
          // @ts-ignore
          currentRow?.position && (
            <>
              <LandDescription land={currentRow as any} />

              {transitions?.map((transition: any, index: number) => {
                console.log(transition);
                return <TransactionInfo transaction={transition} title={index === 0 ? "交易记录" : null} />
              })}
            </>
          )
        }
      </Drawer>

    </PageContainer>
  );
};

export default Admin;
