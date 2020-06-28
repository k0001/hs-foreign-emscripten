{-# LANGUAGE JavaScriptFFI #-}
{-# LANGUAGE OverloadedStrings #-}
module Main where

import System.Exit (die)
import qualified System.IO as IO
import Foreign.C.Types
import Foreign.C.String
import Foreign.Marshal.Alloc
import Foreign.Ptr
import GHCJS.Types (JSVal)

import Foreign.Emscripten as F

main :: IO ()
main = pre >> tests

pre :: IO ()
pre = do
  wrapModIO (F.Mod js_modV)
    [ ("fun1", F.RetVal, [])
    , ("fun2", F.RetVal, [F.ArgVal])
    , ("fun3", F.RetVal, [F.ArgVal, F.ArgVal])
    , ("fun4", F.RetI64, [])
    , ("fun5", F.RetI64, [F.ArgI64])
    , ("fun6", F.RetI64, [F.ArgI64, F.ArgI64])
    , ("fun7", F.RetVoid, [])
    , ("fun8", F.RetVal, [F.ArgBufRz])
    , ("fun9", F.RetVal, [F.ArgBufWz, F.ArgBufR])
    , ("fun10", F.RetStr, [])
    , ("fun11", F.RetStr, [F.ArgBufRz])
    ]

tests :: IO ()
tests = do
  test "fun1" 0 $ c_fun1

  test "fun2(0)" 0 $ c_fun2 0
  test "fun2(1)" 1 $ c_fun2 1

  test "fun3(5, 4)" 9 $ c_fun3 5 4

  test "fun4" 0 $ c_fun4

  test "fun5(0)" 0 $ c_fun5 0
  test "fun5(1)" 1 $ c_fun5 1

  test "fun6(5, 4)" 9 $ c_fun6 5 4

  test "fun7()" () $ c_fun7

  test "fun8(null)" (-1) $ c_fun8 nullPtr

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
test name ex = testIO name ex . pure

testIO
  :: (Eq a, Show a)
  => String -- ^ Test name.
  -> a      -- ^ Expected value.
  -> IO a   -- ^ Actual value.
  -> IO ()
testIO name ex mact = do
  IO.hPutStr IO.stderr (name <> " ... ")
  act <- mact
  if ex == act
     then IO.hPutStrLn IO.stderr "OK"
     else do
       IO.hPutStrLn IO.stderr "ERROR"
       die $ " * Expected:\n     " <> show ex <> "\n * Got:\n     " <> show act

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

foreign import javascript unsafe "$r = h$ffi_emscripten__test_module;"
  js_modV :: JSVal

