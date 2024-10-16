# Docker 

FROM continuumio/miniconda3 

RUN apt-get update && apt-get -y install libgl1-mesa-glx libglib2.0-0

# Set working directory
WORKDIR /app

# Copy the packed conda environment from the builder stage
COPY --from=quay.io/kahlai/emotion-build:multi /env/myenv.tar.gz /tmp/

# Use ADD to extract the packed conda environment
RUN mkdir -p /env/myenv && tar -xzf /tmp/myenv.tar.gz -C /env/myenv && rm -Rf /tmp


# Activate the environment
ENV PATH=/env/myenv/bin:$PATH

RUN echo "source /env/myenv/bin/activate" > ~/.bashrc

RUN pip install gunicorn eventlet 

ARG CACHEBUST=1

COPY *.py .

COPY *.pt .

COPY *.json .

COPY *.h5 .

COPY images images

COPY frontend/build frontend/build

ENV FLASK_ENV="development"
# Command to run when the container starts
CMD [ "python", "app.py" ]

#CMD [ "gunicorn","--worker-class", "eventlet", "--workers", "3", "--bind" , "0.0.0.0:8080", "app:app" ]

#gunicorn --worker-class eventlet --workers 1 --bind 0.0.0.0:8080 app:app
