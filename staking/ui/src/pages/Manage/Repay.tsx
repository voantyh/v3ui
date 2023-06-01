import { Button, Flex, Text } from '@chakra-ui/react';
import { Amount } from '@snx-v3/Amount';
import { BorderBox } from '@snx-v3/BorderBox';
import { DollarCircle } from '@snx-v3/icons';
import { ManagePositionContext } from '@snx-v3/ManagePositionContext';
import { NumberInput } from '@snx-v3/NumberInput';
import { useCollateralType } from '@snx-v3/useCollateralTypes';
import { useUSDProxy } from '@snx-v3/useUSDProxy';
import { useLiquidityPosition } from '@snx-v3/useLiquidityPosition';
import { useTokenBalance } from '@snx-v3/useTokenBalance';
import Wei, { wei } from '@synthetixio/wei';
import { FC, useContext } from 'react';
import { useParams } from 'react-router-dom';

export const RepayUi: FC<{
  debtChange: Wei;
  max?: Wei;
  snxUSDBalance?: Wei;
  currentDebt?: Wei;
  setDebtChange: (val: Wei) => void;
}> = ({ debtChange, setDebtChange, max, currentDebt, snxUSDBalance }) => {
  return (
    <Flex flexDirection="column" gap={2}>
      <Text fontSize="md" fontWeight="700">
        Repay snxUSD
      </Text>
      <Text fontSize="sm" color="gray.400">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Totam consectetur dignissimos velit
        odio cum vitae facilis?
      </Text>
      <BorderBox display="flex" py={1} px={2}>
        <Text display="flex" gap={2} alignItems="center" fontWeight="600" mx="2">
          <DollarCircle />
          snxUSD
        </Text>
        <Flex flexDirection="column" justifyContent="flex-end" flexGrow={1}>
          <NumberInput
            InputProps={{
              isRequired: true,
              'data-testid': 'repay amount input',
              'data-max': max?.toString(),
            }}
            value={debtChange.abs()}
            onChange={(val) => setDebtChange(val.mul(-1))}
            max={max}
          />
          <Flex flexDirection="column" alignItems="flex-end" fontSize="xs" color="whiteAlpha.700">
            <Flex
              gap="1"
              cursor="pointer"
              onClick={() => {
                if (!currentDebt) {
                  return;
                }
                setDebtChange(currentDebt.neg());
              }}
            >
              <Text>Debt:</Text>
              <Amount value={currentDebt} data-testid="current debt" />
            </Flex>
            <Flex
              gap="1"
              cursor="pointer"
              onClick={() => {
                if (!snxUSDBalance) {
                  return;
                }
                setDebtChange(snxUSDBalance.neg());
              }}
            >
              <Text>snxUSD Balance:</Text>
              <Amount value={snxUSDBalance} data-testid="available snxUSD balance" />
            </Flex>
          </Flex>
        </Flex>
      </BorderBox>
      <Button
        data-testid="repay submit"
        type="submit"
        isDisabled={!(max && snxUSDBalance && currentDebt)}
      >
        Repay snxUSD
      </Button>
    </Flex>
  );
};
export const Repay = () => {
  const { debtChange, setDebtChange } = useContext(ManagePositionContext);
  const { data: USDProxy } = useUSDProxy();
  const params = useParams();
  const collateralType = useCollateralType(params.collateralSymbol);

  const { data: liquidityPosition } = useLiquidityPosition({
    tokenAddress: collateralType?.tokenAddress,
    accountId: params.accountId,
    poolId: params.poolId,
  });

  const { data: balance } = useTokenBalance(USDProxy?.address);

  const debtExists = liquidityPosition?.debt.gt(0.01);
  const flooredBalance = balance?.gt(0.01) ? balance : wei(0);

  return (
    <RepayUi
      setDebtChange={setDebtChange}
      debtChange={debtChange}
      snxUSDBalance={flooredBalance}
      currentDebt={debtExists ? liquidityPosition?.debt : wei(0)}
      max={Wei.max(liquidityPosition?.debt || wei(0), balance || wei(0))}
    />
  );
};
