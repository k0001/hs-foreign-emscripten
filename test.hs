module Main where

import System.Exit (die)
import qualified System.IO as IO
import Foreign.C.Types
import Foreign.C.String
import Foreign.Marshal.Alloc

main :: IO ()
main = do
  test "fun1" 0 $ c_fun1

  test "fun2(0)" 0 $ c_fun2 0
  test "fun2(1)" 1 $ c_fun2 1

  test "fun3(5, 4)" 9 $ c_fun3 5 4

  test "fun4" 0 $ c_fun4

  test "fun5(0)" 0 $ c_fun5 0
  test "fun5(1)" 1 $ c_fun5 1

  test "fun6(5, 4)" 9 $ c_fun6 5 4

  test "fun7()" () $ c_fun7

  testIO "fun8(\"hello\")" 5 $ do
    withCString "hello" $ \psrc ->
      pure $ c_fun8 psrc

  testIO "fun9(_, \"hello\")" ("hello", 5) $ do
    withCString "hello" $ \psrc -> do
      allocaBytes 8 $ \pdst -> do
        len <- c_fun9 pdst psrc
        dst <- peekCString pdst -- copies pdst
        pure (dst, len)

  testIO "fun10()" "ding" $ peekCString c_fun10

  testIO "fun11(\"dong\")" "dong" $ do
    withCString "dong" $ \pa -> do
      peekCString (c_fun11 pa)

--------------------------------------------------------------------------------

test
  :: (Eq a, Show a)
  => String -- ^ Test name.
  -> a      -- ^ Expected value.
  -> a      -- ^ Actual value.
  -> IO ()
test name exp = testIO name exp . pure

testIO
  :: (Eq a, Show a)
  => String -- ^ Test name.
  -> a      -- ^ Expected value.
  -> IO a   -- ^ Actual value.
  -> IO ()
testIO name exp mact = do
  IO.hPutStr IO.stderr (name <> " ... ")
  act <- mact
  if exp == act
     then IO.hPutStrLn IO.stderr "OK"
     else do
       IO.hPutStrLn IO.stderr "ERROR"
       die $ " * Expected:\n     " <> show exp <> "\n * Got:\n     " <> show act

--------------------------------------------------------------------------------

foreign import ccall "fun1"  c_fun1  :: CInt
foreign import ccall "fun2"  c_fun2  :: CInt -> CInt
foreign import ccall "fun3"  c_fun3  :: CInt -> CInt -> CInt
foreign import ccall "fun4"  c_fun4  :: CLLong
foreign import ccall "fun5"  c_fun5  :: CLLong -> CLLong
foreign import ccall "fun6"  c_fun6  :: CLLong -> CLLong -> CLLong
foreign import ccall "fun7"  c_fun7  :: ()
foreign import ccall "fun8"  c_fun8  :: CString -> CInt
foreign import ccall "fun9"  c_fun9  :: CString -> CString -> IO CInt
foreign import ccall "fun10" c_fun10 :: CString
foreign import ccall "fun11" c_fun11 :: CString -> CString

