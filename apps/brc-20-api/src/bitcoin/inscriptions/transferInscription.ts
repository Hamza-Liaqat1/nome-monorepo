import { Address, Signer, Tap, Tx } from "@cmdcode/tapscript"
import { HDKey } from "@scure/bip32"
import { TRANSFER_WEIGHT } from "../../constants.js"
export const transferInscription = async ({
  key,
  utxo,
  recipientAddress,
}: {
  key: HDKey
  utxo: {
    txid: string
    vout: number
    amount: number
  }
  recipientAddress: string
}) => {
  const transferTx = Tx.create({
    vin: [
      {
        txid: utxo.txid,
        vout: utxo.vout,
        prevout: {
          value: utxo.amount,
          scriptPubKey: ["OP_1", Tap.getPubKey(key.publicKey!)[0]],
        },
      },
    ],
    vout: [
      {
        value: utxo.amount - TRANSFER_WEIGHT * 2,
        scriptPubKey: Address.toScriptPubKey(recipientAddress),
      },
    ],
  })

  const [tSeckey] = Tap.getSecKey(key.privateKey!)

  const sig = Signer.taproot.sign(tSeckey, transferTx, 0)

  // Let's add this signature to our witness data for input 0.
  transferTx.vin[0].witness = [sig]

  return transferTx
}
