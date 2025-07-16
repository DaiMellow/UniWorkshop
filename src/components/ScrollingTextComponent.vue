<template>
    <div ref="container" class="scroll-container">
        <p ref="text" class="scroll-text">{{ text }}</p>
    </div>
</template>

<script>
export default {
    name: 'ScrollingTextComponent',
    props: {
        text: {
            type: String,
            required: true
        }
    },
    methods: {
        startScrolling() {
            const container = this.$refs.container;
            const text = this.$refs.text;
            const containerWidth = container.clientWidth;
            const textWidth = text.scrollWidth;
            const widthToMove = textWidth - containerWidth + 15;
            console.log(`Width to move: ${widthToMove}`);

            if (widthToMove <= 0) {
                console.log('Text fits within the container, no scrolling needed.');
                return;
            }

            setTimeout(() => {
                let position = 0;
                const scrollInterval = setInterval(() => {
                    position += 1; 
                    text.style.transform = `translateX(-${position}px)`;

                    if (position >= widthToMove) {
                        clearInterval(scrollInterval); // Stop scrolling when done
                        setTimeout(() => {
                            text.style.transform = 'translateX(0)'; // Reset position
                            this.startScrolling(); // Restart scrolling after reset
                        }, 2000); // 1 second pause before restarting
                    }
                }, 20); // Smooth scrolling with 20ms interval
            }, 3000); // Initial delay before starting the scroll
        }
    },
    mounted() {
        console.log('ScrollingTextComponent mounted');
        this.startScrolling();
    },
    beforeDestroy() {
        // Clean up the animation when the component is destroyed
        const text = this.$refs.text;
        text.style.transform = 'translateX(0)';
    },
};
</script>

<style scoped>
.scroll-container {
    overflow: hidden;
    white-space: nowrap;
    width: 240px;
    position: relative;
}
</style>