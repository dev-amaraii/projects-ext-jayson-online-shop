Feature: Jayson Tech client preview smoke test

@preview @smoke
Scenario: Customer can discover products
  Given I navigate to "/"
  Then I should see the heading "Your Everyday Gadget Store"
  And I should see the heading "Popular Products"
  When I type "headphones" into the field "Search products"
  Then the text "Wireless Headphones" should exist

@preview @cart
Scenario: Customer can add a product to the demo cart
  Given I navigate to "/"
  When I click the button "Open cart"
  Then I should see the heading "Your Cart (0)"
  And the text "Checkout coming soon" should exist

@preview @filters
Scenario: Customer can browse a category
  Given I navigate to "/"
  When I click the button "Shop Audio"
  Then the text "Wireless Headphones" should exist
