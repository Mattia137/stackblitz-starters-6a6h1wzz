
import asyncio
from playwright.async_api import async_playwright
import math

async def run():
    async with async_playwright() as p:
        # Launch browser
        browser = await p.chromium.launch(
            headless=True,
            args=['--use-gl=egl']
        )

        # Create a new context and start recording video
        context = await browser.new_context(
            record_video_dir=".",
            record_video_size={"width": 1280, "height": 720},
            viewport={"width": 1280, "height": 720}
        )

        page = await context.new_page()

        # Go to the local server
        print("Navigating to interactive page...")
        await page.goto("http://localhost:3000/interactive.html")

        # Wait for canvas to be present
        await page.wait_for_selector("canvas")

        # Simulate interaction
        print("Starting interaction simulation...")

        center_x = 1280 // 2
        center_y = 720 // 2
        radius = 200

        steps = 120  # 2 seconds at ~60fps logic

        # Move mouse in a circle
        for i in range(steps):
            angle = (i / steps) * 2 * math.pi
            x = center_x + radius * math.cos(angle)
            y = center_y + radius * math.sin(angle)

            await page.mouse.move(x, y)
            await asyncio.sleep(0.05) # Wait a bit between moves

        # Stop recording by closing the context
        await context.close()
        await browser.close()

        print("Video generated successfully.")

asyncio.run(run())
