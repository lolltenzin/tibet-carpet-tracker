
-- Enable RLS on the CarpetOrder table
ALTER TABLE "CarpetOrder" ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to view their own orders
CREATE POLICY "Users can view their own orders" ON "CarpetOrder"
FOR SELECT
USING (
  (auth.uid() IN ( 
    SELECT id FROM auth.users 
    WHERE user_metadata->>'clientCode' = "Buyercode"
  ))
  OR 
  (SELECT user_metadata->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
);

-- Create a policy that allows users to insert their own orders
CREATE POLICY "Users can insert their own orders" ON "CarpetOrder"
FOR INSERT
WITH CHECK (
  ("Buyercode" = (SELECT user_metadata->>'clientCode' FROM auth.users WHERE id = auth.uid()))
  OR 
  (SELECT user_metadata->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
);

-- Create a policy that allows users to update their own orders
CREATE POLICY "Users can update their own orders" ON "CarpetOrder"
FOR UPDATE
USING (
  ("Buyercode" = (SELECT user_metadata->>'clientCode' FROM auth.users WHERE id = auth.uid()))
  OR 
  (SELECT user_metadata->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
);
